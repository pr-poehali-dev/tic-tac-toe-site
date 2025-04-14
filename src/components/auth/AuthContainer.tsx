import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AuthContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkUrl: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkUrl,
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-center p-6">
          <div className="text-sm text-muted-foreground">
            {footerText}{" "}
            <Link to={footerLinkUrl} className="text-primary hover:underline">
              {footerLinkText}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthContainer;
