"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ProcessStep {
  title: string
  description: string
}

interface ProcessModalProps {
  steps: ProcessStep[]
  isOpen: boolean
  onClose: () => void
}

export function ProcessModal({
  steps,
  isOpen,
  onClose
}: ProcessModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleClose = () => {
    setCurrentStep(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Process Walkthrough</DialogTitle>
          <DialogDescription className="text-cyan-400/70">
            Follow these steps to use the encryption tool
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-[25px_1fr] items-start gap-4 px-4",
                index < currentStep ? "text-cyan-400/70" : index === currentStep ? "text-cyan-400" : "text-cyan-400/40"
              )}
            >
              <div className="flex h-2 w-2 translate-y-1 rounded-full bg-cyan-500" />
              <div className="grid gap-1.5">
                <div className="text-sm font-semibold">{step.title}</div>
                <div className="text-sm text-cyan-400/70">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1)
              } else {
                handleClose()
              }
            }}
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {currentStep < steps.length - 1 ? "Next Step" : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
