import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FindDrugs() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      // Use RxNorm API for drug search
      const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch drugs from RxNorm");
      const data = await res.json();
      // Flatten all conceptProperties arrays from all conceptGroups
      const conceptGroups = data.drugGroup?.conceptGroup || [];
      const drugs: any[] = [];
      conceptGroups.forEach((group: any) => {
        if (group.conceptProperties) {
          drugs.push(...group.conceptProperties);
        }
      });
      if (drugs.length === 0) throw new Error("No drugs found for this search.");
      setResults(
        drugs.map((item: any) => ({
          name: item.name || "Unknown",
          description: item.synonym || "No synonym available.",
          rxcui: item.rxcui
        }))
      );

      // Fetch DailyMed details for each drug (by name)
      const detailResults: Record<string, any> = {};
      await Promise.all(drugs.slice(0, 3).map(async (item: any) => { // limit to 3 for performance
        try {
          const dRes = await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(item.name)}`);
          const dData = await dRes.json();
          const setid = dData.data?.[0]?.setid;
          if (!setid) return;
          const sRes = await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setid}/sections.json`);
          const sData = await sRes.json();
          // Map DailyMed sections
          const getSection = (label: string) => {
            const sec = sData.data?.find((s: any) => s.title && s.title.toLowerCase().includes(label));
            return sec ? sec.text : undefined;
          };
          detailResults[item.name] = {
            description: getSection("description") || getSection("highlights") || getSection("overview"),
            usage: getSection("indications") || getSection("usage"),
            benefits: getSection("benefits"),
            side_effects: getSection("side effects") || getSection("adverse reactions"),
            how_to_use: getSection("dosage") || getSection("directions"),
            safety: getSection("warnings") || getSection("precautions") || getSection("safety"),
          };
        } catch {}
      }));
      setDetails(detailResults);

    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Find Drugs</h1>
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Enter drug name or use..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !query}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </Card>
      <div>
        {results.length > 0 && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            <ul className="space-y-6">
              {results.map((drug, idx) => {
                const detail = details[drug.name];
                return (
                  <li key={idx} className="border-b last:border-b-0 pb-4">
                    <span className="font-medium text-teal-800 text-lg">{drug.name}</span>
                    {drug.rxcui && <span className="text-xs text-gray-400 ml-2">RxCUI: {drug.rxcui}</span>}
                    {drug.description && <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{drug.description}</p>}
                    {detail ? (
                      <div className="mt-2 space-y-1">
                        {detail.description && <div><span className="font-semibold">Description:</span> <span className="text-gray-700 whitespace-pre-line">{detail.description}</span></div>}
                        {detail.usage && <div><span className="font-semibold">Usage:</span> <span className="text-gray-700 whitespace-pre-line">{detail.usage}</span></div>}
                        {detail.benefits && <div><span className="font-semibold">Benefits:</span> <span className="text-gray-700 whitespace-pre-line">{detail.benefits}</span></div>}
                        {detail.side_effects && <div><span className="font-semibold">Side Effects:</span> <span className="text-gray-700 whitespace-pre-line">{detail.side_effects}</span></div>}
                        {detail.how_to_use && <div><span className="font-semibold">How to use/take:</span> <span className="text-gray-700 whitespace-pre-line">{detail.how_to_use}</span></div>}
                        {detail.safety && <div><span className="font-semibold">Safety Advice:</span> <span className="text-gray-700 whitespace-pre-line">{detail.safety}</span></div>}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 mt-2">Detailed info loading or unavailable.</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
