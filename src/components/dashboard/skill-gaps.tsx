import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const skills = {
    matched: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "State Management"],
    missing: ["GraphQL", "Kubernetes", "Docker", "CI/CD Pipelines"],
    improvement: ["System Design", "Database Optimization", "Microservices Architecture"]
}

export function SkillGaps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Gap Overview</CardTitle>
        <CardDescription>For "Senior Frontend Engineer" at Vercel</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
        <div className="grid gap-6 p-1">
            <div>
                <h3 className="text-md mb-2 font-semibold">Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {skills.matched.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-md mb-2 font-semibold">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {skills.missing.map(skill => (
                        <Badge key={skill} variant="destructive">{skill}</Badge>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-md mb-2 font-semibold">Needs Improvement</h3>
                <div className="flex flex-wrap gap-2">
                    {skills.improvement.map(skill => (
                        <Badge key={skill} variant="outline" className="border-amber-500 text-amber-500">{skill}</Badge>
                    ))}
                </div>
            </div>
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
