import { useState } from 'react';
import { getHealth } from '../api/health.api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        <div className="flex flex-col items-center justify-center h-screen">
            <Card>
                <CardHeader>
                    <CardTitle>Server Status</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Label>{'Please enter your name:'}</Label>
                    <Input type="text" placeholder="Enter your name" value={name} onChange={(e) => {
                        setName(e.target.value);
                        checkServerStatus();
                    }} />
                    {name && <p>Welcome, {name}!</p>}
                    {message && <p>{message}</p>}
                </CardContent>
                <CardFooter>
                    <Button onClick={checkServerStatus}>Check Server Status</Button>
                </CardFooter>
            </Card>
        </div>
    )
}