import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';

type Session = {
  id: string;
  jobDescriptionId: string;
  createdAt: { seconds: number };
  overallScore: number;
  difficulty: string; // This might need to be fetched from the job description
};

type RecentSessionsProps = {
  sessions: Session[];
};


export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Interview Sessions</CardTitle>
          <CardDescription>
            A log of your most recent mock interview practice sessions.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Role</TableHead>
              <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(session => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="font-medium">{session.jobDescriptionId}</div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant={session.difficulty === 'Hard' ? 'destructive' : session.difficulty === 'Medium' ? 'secondary' : 'default'}>
                  {session.difficulty || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{new Date(session.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">{session.overallScore || 0}%</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/interview/summary/${session.id}`}>
                        <BarChart2 className="h-4 w-4" />
                    </Link>
                </Button>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
