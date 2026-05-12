import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {};

  type UserRole = { #admin; #user; #guest };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type NewActor = {
    accessControlState : AccessControlState;
    conversations : Map.Map<Nat, {
      id : Nat;
      owner : Principal;
      var title : Text;
      var messages : [{
        id : Nat;
        role : { #user; #assistant };
        content : Text;
        timestamp : Int;
      }];
      createdAt : Int;
      var updatedAt : Int;
    }>;
    nextConversationId : { var value : Nat };
    nextMessageId : { var value : Nat };
    openAIApiKey : { var value : ?Text };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty<Principal, UserRole>();
      };
      conversations = Map.empty();
      nextConversationId = { var value = 0 };
      nextMessageId = { var value = 0 };
      openAIApiKey = { var value = null };
    };
  };
};
