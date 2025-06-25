import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

export function generateToken(userId: string, roomId: string): string {
  const appId = Number.parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!)
  const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!

  // For production, generate token on server side
  // For demo, we'll use ZegoUIKitPrebuilt.generateKitTokenForTest
  return ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecret, roomId, userId, userId)
}

export function createZegoInstance(userId: string, roomId: string) {
  const appId = Number.parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!)
  const token = generateToken(userId, roomId)

  return ZegoUIKitPrebuilt.create(token)
}
