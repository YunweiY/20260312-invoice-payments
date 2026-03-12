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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layout/dashboard';
import { CheckIcon } from 'lucide-react';
import { CommonSheet } from '@/components/common/button-sheet';

export default function IndexPage() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');

  async function checkServerStatus() {
    try {
      const response = await getHealth();
      setMessage(response.data.message);
    } catch {
      setMessage('Failed to connect to server');
    }
  }

  return (
    <DashboardLayout
      title="Server Status"
      buttonIcon={<CheckIcon className="h-4 w-4" />}
      buttonText="Check Server Status"
      buttonOnClick={checkServerStatus}
    >
      <div className="flex flex-col items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label>{'Please enter your name:'}</Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                checkServerStatus();
              }}
            />
            {name && <p>Welcome, {name}!</p>}
            {message && <p>{message}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={checkServerStatus}>Check Server Status</Button>
            <CommonSheet
              triggerText="Check Server Status"
              title="Server Status"
              description="Check the status of the server"
            >
              <p>The server is running smoothly.</p>
            </CommonSheet>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
