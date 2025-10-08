import { getCategories } from "@/lib/actions/category.actions";
import { CategoryClient } from "./client/category-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10">
      <CategoryClient data={categories} />
    </div>
  );
}
