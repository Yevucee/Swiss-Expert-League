import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function StatCard({ title, value, subtitle, icon: Icon, color = "text-red-600" }: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  color?: string;
}) {
  return (
    <Card className="border-l-4 border-l-red-600">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}