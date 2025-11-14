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

const sessions = [
    {
        id: "1",
        role: "Senior Frontend Engineer",
        company: "Vercel",
        date: "June 28, 2024",
        score: 78,
        difficulty: "Hard"
    },
    {
        id: "2",
        role: "Full Stack Developer",
        company: "Firebase",
        date: "June 26, 2024",
        score: 72,
        difficulty: "Medium"
    },
    {
        id: "3",
        role: "Software Engineer",
        company: "Google",
        date: "June 24, 2024",
        score: 65,
        difficulty: "Hard"
    },
    {
        id: "4",
        role: "Junior React Developer",
        company: "Startup Inc.",
        date: "June 21, 2024",
        score: 85,
        difficulty: "Easy"
    }
]

export function RecentSessions() {
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
                <div className="font-medium">{session.role}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  {session.company}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge className="text-xs" variant={session.difficulty === 'Hard' ? 'destructive' : session.difficulty === 'Medium' ? 'secondary' : 'default'}>
                  {session.difficulty}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{session.date}</TableCell>
              <TableCell className="text-right">{session.score}%</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="icon" asChild>
                    <Link href="#">
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
