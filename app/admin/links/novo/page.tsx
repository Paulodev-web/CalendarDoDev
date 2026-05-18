import { AdminShell } from "@/components/layout/AdminShell";
import { LinkForm } from "@/components/LinkForm";

export default function NovoLinkPage() {
  return (
    <AdminShell title="Novo link">
      <h1 className="text-title-gradient mb-8 text-3xl font-black">Criar link</h1>
      <LinkForm mode="create" />
    </AdminShell>
  );
}
