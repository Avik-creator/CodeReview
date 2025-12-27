export function CodePattern() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none opacity-20">
      <div className="font-mono text-xs text-muted-foreground space-y-1 px-8">
        <div className="flex gap-2">
          <span className="text-primary">const</span>
          <span>reviewCode</span>
          <span>=</span>
          <span className="text-accent">(</span>
          <span>pull_request</span>
          <span className="text-accent">)</span>
          <span>=&gt;</span>
          <span className="text-accent">{'{'}</span>
        </div>
        <div className="flex gap-2 pl-4">
          <span className="text-primary">if</span>
          <span className="text-accent">(</span>
          <span>pull_request.changes.length</span>
          <span>&gt;</span>
          <span className="text-accent">0</span>
          <span className="text-accent">)</span>
          <span className="text-accent">{'{'}</span>
        </div>
        <div className="flex gap-2 pl-8">
          <span className="text-primary">return</span>
          <span>analyzeWithAI</span>
          <span className="text-accent">(</span>
          <span>pull_request</span>
          <span className="text-accent">)</span>
        </div>
        <div className="flex gap-2 pl-4">
          <span className="text-accent">{'}'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-accent">{'}'}</span>
        </div>
        <div className="h-2" />
        <div className="flex gap-2">
          <span className="text-primary">function</span>
          <span className="text-accent">detectBugs</span>
          <span className="text-accent">(</span>
          <span>code</span>
          <span className="text-accent">)</span>
          <span className="text-accent">{'{'}</span>
        </div>
        <div className="flex gap-2 pl-4">
          <span className="text-primary">const</span>
          <span>issues</span>
          <span>=</span>
          <span>[]</span>
        </div>
        <div className="flex gap-2 pl-4">
          <span className="text-muted-foreground/50">
            // AI-powered analysis
          </span>
        </div>
        <div className="flex gap-2 pl-4">
          <span className="text-primary">for</span>
          <span className="text-accent">(</span>
          <span className="text-primary">let</span>
          <span>line</span>
          <span className="text-primary">of</span>
          <span>code</span>
          <span className="text-accent">)</span>
          <span className="text-accent">{'{'}</span>
        </div>
        <div className="flex gap-2 pl-8 opacity-70">
          <span>issues.push</span>
          <span className="text-accent">(</span>
          <span>analyze</span>
          <span className="text-accent">(</span>
          <span>line</span>
          <span className="text-accent">)</span>
          <span className="text-accent">)</span>
        </div>
        <div className="flex gap-2 pl-4 opacity-50">
          <span className="text-accent">{'}'}</span>
        </div>
      </div>
    </div>
  );
}
