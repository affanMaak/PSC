import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PermissionDenied() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                Your current role doesn't have the required permissions to view this resource.
              </p>
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact your administrator.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Possible reasons:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Your account doesn't have the required role
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  You're trying to access an admin-only section
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Your permissions have been recently changed
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                variant="ghost"
                className="flex-1"
              >
                Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}