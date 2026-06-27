import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, History, Phone, Mail, MessageCircle, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INTERACAO_TIPOS = [
  { value: "telefone", label: "Telefone", icon: Phone },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "visita", label: "Visita", icon: MapPin },
  { value: "outro", label: "Outro", icon: History },
];

export function ProspeccaoDetailsDialog({
  prospeccaoId,
  prospeccao,
  onClose,
}: {
  prospeccaoId: number;
  prospeccao: any | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: interacoes = [], isLoading } = useQuery({
    queryKey: ["interacoes", prospeccaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interacoes_prospeccao")
        .select("*")
        .eq("prospeccao_id", prospeccaoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const addInteracao = useMutation({
    mutationFn: async (v: { tipo: string; observacao: string }) => {
      const { error } = await supabase.from("interacoes_prospeccao").insert({
        prospeccao_id: prospeccaoId,
        tipo: v.tipo,
        observacao: v.observacao,
        data: new Date().toISOString(),
        autor_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interacoes", prospeccaoId] });
      toast.success("Interação registrada");
    },
  });

  const converter = useMutation({
    mutationFn: async () => {
      // 1. Atualiza status para credenciado e define data de conversão
      const { error } = await supabase
        .from("prospeccoes")
        .update({
          etapa: "credenciado",
          convertido_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", prospeccaoId);
      if (error) throw error;

      // 2. Se houver projeto e prestador, vincula o prestador aos municípios do projeto
      if (prospeccao?.projeto_id && prospeccao?.prestador_id) {
        // Busca municípios do projeto
        const { data: projMun } = await supabase
          .from("projeto_municipios")
          .select("municipio_codigo")
          .eq("projeto_id", prospeccao.projeto_id);

        if (projMun && projMun.length > 0) {
          const rows = projMun.map((m: any) => ({
            prestador_id: prospeccao.prestador_id,
            municipio_codigo: m.municipio_codigo,
          }));

          // Insere vínculos (ignora duplicados se houver)
          await supabase.from("prestador_municipios").upsert(rows, { onConflict: "prestador_id,municipio_codigo" });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prospeccoes"] });
      toast.success("Prestador marcado como credenciado!");
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Prospecção</DialogTitle>
        </DialogHeader>

        {prospeccao && (
          <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="font-bold text-lg">{prospeccao.prestadores?.razao_social}</h3>
            <p className="text-sm text-muted-foreground">
              {prospeccao.prestadores?.cidade}/{prospeccao.prestadores?.uf}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{prospeccao.projetos?.nome || "Sem projeto"}</Badge>
              <Badge>{prospeccao.etapa}</Badge>
              {prospeccao.convertido_em && (
                <Badge variant="success">
                  Credenciado em {new Date(prospeccao.convertido_em).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4" /> Histórico de Interações
            </h4>
            <div className="space-y-3">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : interacoes.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma interação registrada.</p>
              ) : (
                interacoes.map((i) => (
                  <div key={i.id} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{i.tipo}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(i.data).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{i.observacao}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Nova Interação</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                addInteracao.mutate({
                  tipo: String(fd.get("tipo")),
                  observacao: String(fd.get("observacao")),
                });
                (e.target as HTMLFormElement).reset();
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Select name="tipo" defaultValue="telefone">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACAO_TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-3.5 w-3.5" /> {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea name="observacao" placeholder="O que foi conversado?" required />
              <Button type="submit" size="sm" disabled={addInteracao.isPending}>
                Registrar
              </Button>
            </form>
          </section>

          {!prospeccao?.convertido_em && (
            <section className="pt-4 border-t border-border flex justify-end">
              <Button
                variant="success"
                onClick={() => {
                  if (confirm("Confirmar credenciamento deste prestador?")) converter.mutate();
                }}
                disabled={converter.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar como Credenciado
              </Button>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
