import BrandForm from "@/components/brain/BrandForm";
import PageLoader from "@/components/kit/PageLoader";
import { useBrand } from "@/hooks/useCreatorData";

export default function BrandProfile() {
  const { data: brand, isLoading } = useBrand();

  if (isLoading) return <PageLoader />;

  return <BrandForm key={brand?.id || "new"} brand={brand} />;
}