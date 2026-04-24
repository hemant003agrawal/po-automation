import { Card, CardContent, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartData = {
  name: string;
  value: number;
};

type Props = {
  title: string;
  data: ChartData[];
};

export default function ChartCard({ title, data }: Props) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
