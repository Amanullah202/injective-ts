import { TokenType, TokenSource, TokenMetaNew, IbcTokenMetaNew } from './types'
type TokenMeta = TokenMetaNew | IbcTokenMetaNew

export class TokenFactoryNew {
  public registry: TokenMeta[]
  public tokensByDenom: Record<string, TokenMeta>
  public tokensBySymbol: Record<string, TokenMeta[]>

  constructor(registry: TokenMeta[]) {
    this.registry = registry
    this.tokensByDenom = registry.reduce((list, token) => {
      const denom = token.denom.toLowerCase()

      if (list[denom]) {
        return list
      }

      return { ...list, [denom]: token }
    }, {} as Record<string, TokenMeta>)

    this.tokensBySymbol = registry.reduce((list, token) => {
      const symbol = token.symbol.toLowerCase()

      return { ...list, [symbol]: [...(list[symbol] || []), token] }
    }, {} as Record<string, TokenMeta[]>)
  }

  toToken(denom: string): TokenMeta | undefined {
    return this.getMetaByDenomOrAddress(denom) || this.getMetaBySymbol(denom)
  }

  getMetaBySymbol(
    symbol: string,
    { source, type }: { source?: TokenSource; type?: TokenType } = {},
  ): TokenMeta | undefined {
    const tokensBySymbol = this.tokensBySymbol[symbol.toLowerCase()]

    if (!tokensBySymbol) {
      return
    }

    const token = tokensBySymbol.find((tokenMeta) => {
      const isType = !type || tokenMeta.tokenType === type
      const isSource = !source || tokenMeta.source === source

      return isType || isSource
    })

    return token || tokensBySymbol[0]
  }

  getMetaByDenomOrAddress(denom: string): TokenMeta | undefined {
    const formattedDenom = denom.toLowerCase()

    return this.tokensByDenom[formattedDenom]
  }
}
