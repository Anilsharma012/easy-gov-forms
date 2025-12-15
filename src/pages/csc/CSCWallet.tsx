import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, ArrowUpRight, ArrowDownRight, IndianRupee, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WalletData {
  balance: number;
  pendingWithdrawal: number;
  totalEarnings: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

const CSCWallet = () => {
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, pendingWithdrawal: 0, totalEarnings: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/wallet", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet || { balance: 0, pendingWithdrawal: 0, totalEarnings: 0 });
        setTransactions(data.recentTransactions || []);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > wallet.balance) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }

    setWithdrawing(true);
    try {
      const response = await fetch("/api/csc/dashboard/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Withdrawal request submitted for approval" });
        setWithdrawAmount("");
        setDialogOpen(false);
        fetchWalletData();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "Failed to process withdrawal", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process withdrawal", variant: "destructive" });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-8 h-8" />
              <span className="text-3xl font-bold">{wallet.balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-6 h-6 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{wallet.pendingWithdrawal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-green-600" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold">{wallet.totalEarnings.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Amount (INR)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available: ₹{wallet.balance.toLocaleString()}
                </p>
              </div>
              <Button 
                onClick={handleWithdraw} 
                disabled={withdrawing}
                className="w-full"
              >
                {withdrawing ? "Processing..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {tx.type === "credit" ? (
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </p>
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CSCWallet;
