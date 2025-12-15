import { useState, useEffect } from "react";
import { Copy, Gift, Users, TrendingUp, Share2, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ReferralData {
  referralCode: string;
  referralCount: number;
  rewardPoints: number;
  referrals: Array<{
    id: string;
    referredUser: {
      name: string;
      email: string;
      createdAt: string;
    };
    status: string;
    rewardPoints: number;
    completedAt?: string;
    createdAt: string;
  }>;
}

interface RewardsData {
  rewards: Array<{
    level: number;
    referrals: number;
    reward: string;
  }>;
  currentLevel: number;
  nextReward: {
    level: number;
    referrals: number;
    reward: string;
  };
}

export default function Referrals() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralData | null>(null);
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [referralsRes, rewardsRes] = await Promise.all([
        fetch("/api/referrals/my-referrals", { credentials: "include" }),
        fetch("/api/referrals/rewards", { credentials: "include" }),
      ]);

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        setData(referralsData);
        setReferralLink(`${window.location.origin}/register?ref=${referralsData.referralCode}`);
      }

      if (rewardsRes.ok) {
        const rewards = await rewardsRes.json();
        setRewardsData(rewards);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const rewards = rewardsData?.rewards || [
    { level: 1, referrals: 3, reward: "₹100 discount on next package" },
    { level: 2, referrals: 5, reward: "₹200 discount + 2 free forms" },
    { level: 3, referrals: 10, reward: "₹500 discount + 5 free forms" },
    { level: 4, referrals: 20, reward: "Free Starter Package" },
  ];

  const currentLevel = rewardsData?.currentLevel || 0;
  const nextReward = rewardsData?.nextReward || rewards[0];
  const progressToNextLevel = nextReward
    ? ((data?.referralCount || 0) / nextReward.referrals) * 100
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Referral & Rewards</h1>
        <p className="text-muted-foreground">
          Invite friends and earn rewards on every successful referral.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-accent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data?.referralCount || 0}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{data?.rewardPoints || 0}</p>
                <p className="text-sm text-muted-foreground">Reward Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-3xl font-bold">Level {currentLevel + 1}</p>
                <p className="text-sm text-muted-foreground">Your Level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={data?.referralCode || ""}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(data?.referralCode || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Link</label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="text-sm" />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(referralLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=Join Easy Gov Forms and get your government job applications done easily! Use my referral code: ${data?.referralCode} ${referralLink}`,
                  "_blank"
                )
              }
            >
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => copyToClipboard(referralLink)}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress to Next Reward</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {data?.referralCount || 0} / {nextReward?.referrals || 3} referrals
              </span>
              <Badge variant="secondary">{nextReward?.reward}</Badge>
            </div>
            <Progress value={Math.min(progressToNextLevel, 100)} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {(nextReward?.referrals || 3) - (data?.referralCount || 0)} more referrals to
              unlock: <span className="text-primary font-medium">{nextReward?.reward}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Reward Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {rewards.map((reward, index) => {
              const isUnlocked = (data?.referralCount || 0) >= reward.referrals;
              const isCurrent =
                (data?.referralCount || 0) >= reward.referrals &&
                (index === rewards.length - 1 ||
                  (data?.referralCount || 0) < rewards[index + 1].referrals);

              return (
                <div
                  key={reward.level}
                  className={`p-4 rounded-lg border ${
                    isUnlocked
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/50 border-border"
                  } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={isUnlocked ? "default" : "secondary"}>
                      Level {reward.level}
                    </Badge>
                    {isUnlocked && (
                      <Badge className="bg-success">Unlocked</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {reward.referrals} Referrals
                  </p>
                  <p className="text-sm text-muted-foreground">{reward.reward}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {data?.referrals && data.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{referral.referredUser?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.status === "completed" ? (
                      <Badge className="bg-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        +{referral.rewardPoints} points
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-1">Share Your Code</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code with friends and family
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium mb-1">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                When they register using your code and buy a package
              </p>
            </div>
            <div className="text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium mb-1">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                You both get rewards - 50 points each!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
