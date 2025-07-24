// components/museum/form/Dropdown.tsx
import { Category } from "@/schemas";
import { startTransition, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, getAllCategories } from "@/actions/category";
import { Plus } from "lucide-react";

type DropdownProps = {
  value?: string;
  onChangeHandler?: (val: string) => void;
};

export default function Dropdown({ value, onChangeHandler }: DropdownProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddCategory = async () => {
    const category = await createCategory({ categoryName: newCategory.trim() });
    if (!category) return;
    setCategories((prev) => [...prev, category]);
    setNewCategory("");
  };

  useEffect(() => {
    (async () => {
      const list = await getAllCategories();
      if (list) setCategories(list as Category[]);
    })();
  }, []);

  return (
    <Select
      defaultValue={value}
      onValueChange={(val) => onChangeHandler?.(val)}
    >
      <SelectTrigger className="bg-grey-150 h-[54px] border border-gray-300 px-5 py-3 placeholder:text-grey-500  focus-visible:ring-transparent">
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>

      <SelectContent side="bottom" align="start" className="w-full p-0">
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-200 scrollbar-thin scrollbar-thumb-gray-300">
          {categories.map((category) => (
            <SelectItem
              key={category.id}
              value={category.id}
              className="py-3 px-5 text-base hover:bg-primary-50 focus:bg-primary-50"
            >
              {category.name}
            </SelectItem>
          ))}
        </div>

        <div className="border-t border-gray-200">
          <AlertDialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setNewCategory("");
            }}
          >
            <AlertDialogTrigger className="flex w-full items-center justify-center gap-2 py-3 text-primary-600 hover:bg-primary-50">
              <Plus className="w-4 h-4" />
              Add new category
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>New Category</AlertDialogTitle>
                <AlertDialogDescription>
                  <Input
                    type="text"
                    placeholder="Category name"
                    className="w-full bg-grey-50 h-[54px] rounded-full px-4 py-3 placeholder:text-grey-500 focus-visible:ring-transparent mt-3"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(handleAddCategory);
                    setDialogOpen(false);
                  }}
                >
                  Add
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SelectContent>
    </Select>
  );
}
