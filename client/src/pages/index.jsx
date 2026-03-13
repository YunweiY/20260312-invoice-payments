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
import { Spinner } from '@/components/ui/spinner';
import { RocketIcon, AlertTriangleIcon } from 'lucide-react';

export default function IndexPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function checkServerStatus() {
    try {
      const response = await getHealth();
      setMessage(response.data.message);
      setError(null);
    } catch (error) {
      setError(error);
      setMessage('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardLayout title="Home" enableButton={false}>
      <div className="flex h-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Check the server status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {message && (
              <>
                {error ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2">
                      <AlertTriangleIcon className="size-10 text-red-600 animate-bounce" />
                      <AlertTriangleIcon className="size-10 text-red-600 animate-bounce delay-75" />
                      <AlertTriangleIcon className="size-10 text-red-600 animate-bounce delay-150" />
                    </div>
                    <p className="text-center text-lg font-medium text-red-600">
                      {message}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row gap-2">
                      <RocketIcon className="size-10 text-green-600 animate-ping" />
                      <RocketIcon className="size-10 text-green-600 animate-ping delay-75" />
                      <RocketIcon className="size-10 text-green-600 animate-ping delay-150" />
                    </div>
                    <p className="text-center text-lg font-medium text-green-600">
                      {message}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={async () => {
                setIsLoading(true);
                await checkServerStatus();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="size-4" />
              ) : (
                'Check Server Status'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
