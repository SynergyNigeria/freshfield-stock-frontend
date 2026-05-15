import AdminUserDetailContent from "./AdminUserDetailContent";
export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminUserDetailContent params={params} />;
}
