"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { candidatesApi, type AnalysisOut, type CandidateOut } from "@/lib/api";
import { ExpandableText } from "./ExpandableText";
import { CandidateActions } from "./CandidateActions";
import { useTranslation } from "@/lib/language";

type Row = AnalysisOut & CandidateOut;

export function RecommendedCandidates() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const hydrateRows = async (): Promise<Row[]> => {
    const rec = await candidatesApi.getRecommended(); // AnalysisOut[]
    const list: Row[] = await Promise.all(
      rec.map(async (a) => {
        let cand: CandidateOut | null = null;
        try {
          cand = await candidatesApi.getById(a.user_id);
        } catch {
          cand = { id: a.user_id, name: null } as CandidateOut; // fallback
        }
        const name = cand.name ?? `ID ${a.user_id}`;
        return { ...a, ...cand, name };
      })
    );
    return list;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setRows(await hydrateRows());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">{t("loading") ?? "Загрузка…"}</div>;

  const color = (score: number) =>
    score >= 70
      ? "bg-green-100 text-green-800"
      : score >= 50
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  const handleUpdate = async (_userId: number, _updated: CandidateOut | null) => {
    try {
      setRows(await hydrateRows());
    } catch (err) {
      console.error("Ошибка обновления списка кандидатов:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("candidatesTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">{t("name")}</TableHead>
              <TableHead className="w-[20%]">{t("position")}</TableHead>
              <TableHead className="w-[10%]">{t("score")}</TableHead>
              <TableHead className="w-[25%]">{t("strengths")}</TableHead>
              <TableHead className="w-[25%]">{t("weaknesses")}</TableHead>
              <TableHead className="w-[15%]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.id}-${r.position ?? "pos"}`}>
                <TableCell className="align-top">{r.name ?? `ID ${r.id}`}</TableCell>
                <TableCell className="align-top">
                  <ExpandableText text={r.position ?? ""} limit={120} />
                </TableCell>
                <TableCell className="align-top">
                  <Badge className={color(r.score)}>{Math.round(r.score)}%</Badge>
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words">
                  <ExpandableText text={r.strengths ?? ""} limit={120} />
                </TableCell>
                <TableCell className="align-top whitespace-normal break-words">
                  <ExpandableText text={r.weaknesses ?? ""} limit={120} />
                </TableCell>
                <TableCell className="align-top">
                  <CandidateActions
                    candidate={r}
                    onUpdate={(updated) => handleUpdate(r.id, updated)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
