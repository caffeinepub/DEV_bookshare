import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddBook,
  useDeleteBook,
  useListMyBooks,
  useUpdateBook,
} from "@/hooks/use-backend";
import type { BookCondition } from "@/types";
import {
  BookMarked,
  BookOpen,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONDITIONS: BookCondition[] = ["new", "good", "fair", "poor"];

const CONDITION_LABEL: Record<BookCondition, string> = {
  new: "New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const CONDITION_STYLE: Record<BookCondition, { badge: string; dot: string }> = {
  new: {
    badge: "bg-accent/20 text-accent-foreground border-accent/40",
    dot: "bg-accent",
  },
  good: {
    badge: "bg-secondary/20 text-secondary-foreground border-secondary/40",
    dot: "bg-secondary",
  },
  fair: {
    badge: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary",
  },
  poor: {
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

interface EditState {
  bookId: bigint;
  title: string;
  author: string;
  condition: BookCondition;
  location: string;
}

export default function MyBooksPage() {
  const { data: books, isLoading } = useListMyBooks();
  const addMutation = useAddBook();
  const deleteMutation = useDeleteBook();
  const updateMutation = useUpdateBook();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState<BookCondition>("good");
  const [location, setLocation] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);

  const openEdit = (book: {
    id: bigint;
    title: string;
    author: string;
    condition: BookCondition;
    location: string;
  }) => {
    setEditState({
      bookId: book.id,
      title: book.title,
      author: book.author,
      condition: book.condition,
      location: book.location,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState) return;
    try {
      await updateMutation.mutateAsync({
        bookId: editState.bookId,
        fields: {
          title: editState.title.trim(),
          author: editState.author.trim(),
          condition: editState.condition,
          location: editState.location.trim(),
        },
      });
      toast.success("Book updated successfully.");
      setEditOpen(false);
      setEditState(null);
    } catch {
      toast.error("Failed to update book. Please try again.");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    try {
      await addMutation.mutateAsync({
        title: title.trim(),
        author: author.trim(),
        condition,
        location,
      });
      toast.success(`"${title}" added to your shelf!`);
      setTitle("");
      setAuthor("");
      setCondition("good");
      setLocation("");
      setOpen(false);
    } catch {
      toast.error("Failed to add book. Please try again.");
    }
  };

  const handleDelete = async (id: bigint, bookTitle: string) => {
    if (!window.confirm(`Remove "${bookTitle}" from your shelf?`)) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`"${bookTitle}" removed from your shelf.`);
    } catch {
      toast.error("Failed to remove book.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full" data-ocid="my-books.page">
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                My Books
              </h1>
              <p className="text-muted-foreground mt-1">
                Books you've listed for the community to borrow
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-ocid="my-books.add_book_button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent data-ocid="my-books.add_book_dialog">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    Add a Book to Lend
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="book-title">Title</Label>
                    <Input
                      id="book-title"
                      placeholder="e.g. The Midnight Library"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      data-ocid="my-books.title_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="book-author">Author</Label>
                    <Input
                      id="book-author"
                      placeholder="e.g. Matt Haig"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                      data-ocid="my-books.author_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="book-location">
                      Location{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="book-location"
                      placeholder="e.g. Downtown Library, Shelf 3"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      data-ocid="my-books.location_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Condition</Label>
                    <Select
                      value={condition}
                      onValueChange={(v) => setCondition(v as BookCondition)}
                    >
                      <SelectTrigger data-ocid="my-books.condition_select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="flex items-center gap-2">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${
                                  CONDITION_STYLE[c].dot
                                }`}
                              />
                              {CONDITION_LABEL[c]}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      New = unopened · Good = light use · Fair = visible wear ·
                      Poor = heavy wear
                    </p>
                  </div>
                  <DialogFooter className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      data-ocid="my-books.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !title.trim() || !author.trim() || addMutation.isPending
                      }
                      data-ocid="my-books.submit_button"
                    >
                      {addMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Book"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : books && books.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="my-books.books_list"
          >
            {books.map((book, idx) => {
              const cond = CONDITION_STYLE[book.condition as BookCondition];
              return (
                <Card
                  key={String(book.id)}
                  data-ocid={`my-books.book_card.${idx + 1}`}
                  className="flex flex-col hover:shadow-md transition-smooth"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          book.isAvailable
                            ? "bg-accent/15 text-accent-foreground border-accent/35"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {book.isAvailable ? "Available" : "Borrowed"}
                      </Badge>
                    </div>
                    <CardTitle className="font-display text-base leading-snug mt-2">
                      {book.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground italic">
                      {book.author}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${cond?.badge ?? ""}`}
                    >
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${cond?.dot ?? ""}`}
                      />
                      {CONDITION_LABEL[book.condition as BookCondition] ??
                        book.condition}
                    </Badge>
                    {book.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{book.location}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(book)}
                      data-ocid={`my-books.edit_button.${idx + 1}`}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deletingId === book.id}
                      onClick={() => handleDelete(book.id, book.title)}
                      data-ocid={`my-books.delete_button.${idx + 1}`}
                    >
                      {deletingId === book.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Remove
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-24 text-center rounded-2xl bg-muted/20 border border-dashed border-border"
            data-ocid="my-books.empty_state"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BookMarked className="h-8 w-8 text-primary/50" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground">
              No books listed yet
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Share your books with the community — list one to start lending.
            </p>
            <Button
              className="mt-6"
              onClick={() => setOpen(true)}
              data-ocid="my-books.empty_add_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first book
            </Button>
          </div>
        )}
      </div>

      {/* Edit Book Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditState(null);
        }}
      >
        <DialogContent data-ocid="my-books.edit_book_dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Book</DialogTitle>
          </DialogHeader>
          {editState && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-book-title">Title</Label>
                <Input
                  id="edit-book-title"
                  placeholder="e.g. The Midnight Library"
                  value={editState.title}
                  onChange={(e) =>
                    setEditState((s) =>
                      s ? { ...s, title: e.target.value } : s,
                    )
                  }
                  required
                  data-ocid="my-books.edit_title_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-book-author">Author</Label>
                <Input
                  id="edit-book-author"
                  placeholder="e.g. Matt Haig"
                  value={editState.author}
                  onChange={(e) =>
                    setEditState((s) =>
                      s ? { ...s, author: e.target.value } : s,
                    )
                  }
                  required
                  data-ocid="my-books.edit_author_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-book-location">
                  Location{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="edit-book-location"
                  placeholder="e.g. Downtown Library, Shelf 3"
                  value={editState.location}
                  onChange={(e) =>
                    setEditState((s) =>
                      s ? { ...s, location: e.target.value } : s,
                    )
                  }
                  data-ocid="my-books.edit_location_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select
                  value={editState.condition}
                  onValueChange={(v) =>
                    setEditState((s) =>
                      s ? { ...s, condition: v as BookCondition } : s,
                    )
                  }
                >
                  <SelectTrigger data-ocid="my-books.edit_condition_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${CONDITION_STYLE[c].dot}`}
                          />
                          {CONDITION_LABEL[c]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setEditState(null);
                  }}
                  data-ocid="my-books.edit_cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !editState.title.trim() ||
                    !editState.author.trim() ||
                    updateMutation.isPending
                  }
                  data-ocid="my-books.edit_save_button"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
