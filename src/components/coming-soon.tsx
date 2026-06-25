import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </header>
      <Card>
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Construction className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">Em construção</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Esta tela está sendo migrada da versão Streamlit. A estrutura está
            pronta — em breve traremos todas as funcionalidades originais com a
            nova experiência.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
