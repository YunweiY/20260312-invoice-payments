import { useState } from 'react';
import { getHealth } from '../api/health.api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/layout/dashboard';

export default function IndexPage() {
  const [message, setMessage] = useState('');

  async function checkServerStatus() {
    try {
      const response = await getHealth();
      setMessage(response.data.message);
    } catch {
      setMessage('Failed to connect to server');
    }
  }

  return (
    <DashboardLayout title="Home" enableButton={false}>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Check the server status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {message && (
              <p className="text-center text-lg font-medium">{message}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={checkServerStatus}>Check Server Status</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
