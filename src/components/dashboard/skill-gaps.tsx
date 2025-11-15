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


type SkillGap = {
    matchedSkills: string[];
    missingSkills: string[];
    jobDescriptionId?: string;
}

type SkillGapsProps = {
    skillGap: SkillGap | undefined;
}

export function SkillGaps({ skillGap }: SkillGapsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Gap Overview</CardTitle>
        <CardDescription>
            {skillGap?.jobDescriptionId ? `For "${skillGap.jobDescriptionId}"` : 'No analysis performed yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[260px]">
        <div className="grid gap-6 p-1">
            <div>
                <h3 className="text-md mb-2 font-semibold">Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {(skillGap?.matchedSkills || []).map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50">{skill}</Badge>
                    ))}
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="text-md mb-2 font-semibold">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {(skillGap?.missingSkills || []).map(skill => (
                        <Badge key={skill} variant="destructive">{skill}</Badge>
                    ))}
                </div>
            </div>
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
