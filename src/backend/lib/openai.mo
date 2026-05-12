import { defaultConfig; type Config } "mo:openai-client/Config";
import ChatApi "mo:openai-client/Apis/ChatApi";
import CreateChatCompletionRequest "mo:openai-client/Models/CreateChatCompletionRequest";
import ChatCompletionRequestMessage "mo:openai-client/Models/ChatCompletionRequestMessage";
import ChatCompletionRequestUserMessage "mo:openai-client/Models/ChatCompletionRequestUserMessage";
import ChatCompletionRequestAssistantMessage "mo:openai-client/Models/ChatCompletionRequestAssistantMessage";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

module {
  /// Builds an OpenAI Config from a bearer key.
  /// `is_replicated = ?false` is REQUIRED — see extension-openai §3.
  public func configForKey(key : Text) : Config {
    {
      defaultConfig with
      auth = ?#bearer key;
      is_replicated = ?false;
    };
  };

  /// Runs a single-turn chat completion and returns the assistant's text.
  public func runChatCompletion(config : Config, prompt : Text) : async* Text {
    let userMessage = ChatCompletionRequestUserMessage.JSON.init({
      content = #string prompt;
      role = #user;
    });
    let req = CreateChatCompletionRequest.JSON.init({
      messages = [#user userMessage];
      model = "gpt-4o-mini";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("OpenAI returned no choices");
    };
    switch (resp.choices[0].message.content) {
      case (?text) text;
      case null Runtime.trap("OpenAI returned no text content");
    };
  };

  /// Runs a multi-turn chat completion from a full message history.
  public func runChatCompletionWithHistory(
    config : Config,
    messages : [{ role : { #user; #assistant }; content : Text }],
  ) : async* Text {
    let chatMessages : [ChatCompletionRequestMessage.ChatCompletionRequestMessage] = messages.map(func(m : { role : { #user; #assistant }; content : Text }) : ChatCompletionRequestMessage.ChatCompletionRequestMessage {
        switch (m.role) {
          case (#user) {
            let userMsg = ChatCompletionRequestUserMessage.JSON.init({
              content = #string(m.content);
              role = #user;
            });
            #user(userMsg);
          };
          case (#assistant) {
            let assistantMsg = ChatCompletionRequestAssistantMessage.JSON.init({
              role = #assistant;
            });
            #assistant({ assistantMsg with content = ?(#string(m.content)) });
          };
        };
      }
    );
    let req = CreateChatCompletionRequest.JSON.init({
      messages = chatMessages;
      model = "gpt-4o-mini";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("OpenAI returned no choices");
    };
    switch (resp.choices[0].message.content) {
      case (?text) text;
      case null Runtime.trap("OpenAI returned no text content");
    };
  };
};
