"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, Check, RotateCcw } from "lucide-react"

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
  isOpen: boolean
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, isOpen }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', error => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not create canvas context')
    }

    const rotRad = getRadianAngle(rotation)
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    )

    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    ctx.drawImage(image, 0, 0)

    const croppedCanvas = document.createElement('canvas')
    const croppedCtx = croppedCanvas.getContext('2d')

    if (!croppedCtx) {
      throw new Error('Could not create cropped canvas context')
    }

    croppedCanvas.width = pixelCrop.width
    croppedCanvas.height = pixelCrop.height

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return croppedCanvas.toDataURL('image/jpeg', 0.8)
  }

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || isProcessing) return

    setIsProcessing(true)

    try {
      console.log('Starting crop process...')
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      console.log('Crop completed successfully')
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
      // Reset processing state on error
      setIsProcessing(false)
      // You could show an error message here
      alert('Failed to crop image. Please try again.')
    }
  }

  const resetRotation = () => {
    setRotation(0)
  }

  const handleCancel = () => {
    setIsProcessing(false)
    onCancel()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top bg-black/50">
        <button
          onClick={handleCancel}
          disabled={isProcessing}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 touch-manipulation disabled:opacity-50"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg font-semibold text-white">Crop Photo</h2>
        <button
          onClick={handleCropConfirm}
          disabled={isProcessing || !croppedAreaPixels}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 touch-manipulation disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
          onCropComplete={onCropCompleteCallback}
          style={{
            containerStyle: {
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent'
            }
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-4 pb-safe-bottom space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={isProcessing}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm font-medium">Rotation</label>
            <button
              onClick={resetRotation}
              disabled={isProcessing}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            disabled={isProcessing}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            disabled={isProcessing || !croppedAreaPixels}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl transition-all duration-200 active:scale-95 font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}