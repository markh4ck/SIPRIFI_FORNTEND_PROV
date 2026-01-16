import { http, createConfig } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo"

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [sepolia.id]: http(),
  },
})

// Export sepolia chain id for reference
export const SUPPORTED_CHAIN_ID = sepolia.id
