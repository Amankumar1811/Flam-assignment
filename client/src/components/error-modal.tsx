import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export function ErrorModal({ 
  isOpen, 
  title, 
  message, 
  onRetry, 
  onDismiss 
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="max-w-md border-destructive">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-3">
          {onRetry && (
            <Button 
              variant="destructive" 
              onClick={onRetry}
              className="flex-1"
            >
              Retry
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="flex-1"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
