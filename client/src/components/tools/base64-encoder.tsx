import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Code, ArrowRight, Copy } from "lucide-react";

export default function Base64Encoder() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const { toast } = useToast();

  const encodeMutation = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      const response = await apiRequest("POST", "/api/osint/base64-encode", { text });
      return response.json();
    },
    onSuccess: (data) => {
      setOutputText(data.encoded);
      toast({
        title: "Encoding Complete",
        description: "Text has been encoded to Base64",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const decodeMutation = useMutation({
    mutationFn: async ({ encoded }: { encoded: string }) => {
      const response = await apiRequest("POST", "/api/osint/base64-decode", { encoded });
      return response.json();
    },
    onSuccess: (data) => {
      setInputText(data.decoded);
      toast({
        title: "Decoding Complete",
        description: "Base64 has been decoded to text",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEncode = () => {
    if (!inputText.trim()) return;
    encodeMutation.mutate({ text: inputText });
  };

  const handleDecode = () => {
    if (!outputText.trim()) return;
    decodeMutation.mutate({ encoded: outputText });
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Base64 output copied to clipboard",
      });
    }
  };

  return (
    <Card className="bg-[hsl(217,32%,17%)] border-[hsl(215,14%,34%)] tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Code className="h-5 w-5 mr-2 text-[hsl(207,90%,54%)]" />
            Base64 Encoder/Decoder
          </CardTitle>
        </div>
        <p className="text-gray-400 text-sm">Encode and decode Base64 strings</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="input" className="text-gray-300">Input Text</Label>
            <Textarea
              id="input"
              placeholder="Enter text to encode..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              rows={4}
            />
            <Button
              onClick={handleEncode}
              disabled={encodeMutation.isPending || !inputText.trim()}
              className="mt-2 bg-[hsl(207,90%,54%)] hover:bg-blue-600 text-white"
            >
              {encodeMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Encoding...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Encode
                </>
              )}
            </Button>
          </div>
          
          <div>
            <Label htmlFor="output" className="text-gray-300">Base64 Output</Label>
            <Textarea
              id="output"
              placeholder="Encoded result will appear here..."
              value={outputText}
              onChange={(e) => setOutputText(e.target.value)}
              className="bg-[hsl(215,25%,27%)] border-[hsl(215,14%,34%)] text-white placeholder-gray-400"
              rows={4}
            />
            <div className="mt-2 flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={!outputText}
                variant="outline"
                className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={handleDecode}
                disabled={decodeMutation.isPending || !outputText.trim()}
                variant="outline"
                className="border-[hsl(215,25%,27%)] hover:bg-[hsl(215,25%,27%)] text-white"
              >
                {decodeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Decoding...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Decode
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
