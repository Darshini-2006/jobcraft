import { ReadinessScore } from '@/components/dashboard/readiness-score';
import { RecentSessions } from '@/components/dashboard/recent-sessions';
import { SkillGaps } from '@/components/dashboard/skill-gaps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingDown, Book, BarChart, CheckCircle, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
      {/* Main Column */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 xl:col-span-3">
        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
            <Button asChild size="lg" className="h-auto py-4 text-base">
                <Link href="/analysis/new">
                    <BarChart className="mr-3 h-6 w-6" /> Start New Mock Interview
                </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-4 text-base">
                <Link href="/resume/edit">
                    <Target className="mr-3 h-6 w-6" /> Upload / Edit Resume
                </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-auto py-4 text-base">
                <Link href="/analysis/new">
                    <Book className="mr-3 h-6 w-6" /> Add Job Description
                </Link>
            </Button>
        </div>
        
        {/* Top Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <ReadinessScore readinessScore={78} />
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Skill Gaps
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Skills to improve for target roles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weakest Area</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">System Design</div>
              <p className="text-xs text-muted-foreground">
                Average score of 62%
              </p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78</div>
              <p className="text-xs text-muted-foreground">
                Answered across 5 sessions
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Sessions */}
        <RecentSessions />
      </div>

      {/* Right Sidebar Column */}
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1 xl:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5"/> Profile Snapshot
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
                <p className="font-semibold text-lg">Jane Doe</p>
                <p className="text-muted-foreground">jane.doe@example.com</p>
                <div className="border-t pt-3">
                    <p><span className="font-medium">Preparing for:</span> Senior Frontend Engineer</p>
                    <p><span className="font-medium">Total Sessions:</span> 5</p>
                    <p><span className="font-medium">Last Active:</span> Today</p>
                </div>
            </CardContent>
        </Card>

        <SkillGaps />

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Resume Uploaded</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Job Description Analyzed</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Skill Gap Calculated</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Mock Interview Started</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Ready for Interview (score ≥ 80)</span>
                    </li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
