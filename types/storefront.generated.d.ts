/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.d.ts';

export type CartCreateMutationVariables = StorefrontTypes.Exact<{
  input: StorefrontTypes.CartInput;
}>;


export type CartCreateMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message'>> }> };

export type CartLinesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type CartLinesAddMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'code' | 'message'>> }> };

export type CartLinesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type CartLinesUpdateMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartLinesRemoveMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lineIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartLinesRemoveMutation = { cartLinesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartBuyerIdentityUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  buyerIdentity: StorefrontTypes.CartBuyerIdentityInput;
}>;


export type CartBuyerIdentityUpdateMutation = { cartBuyerIdentityUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartDeliveryAddressesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  addresses: Array<StorefrontTypes.CartSelectableAddressInput> | StorefrontTypes.CartSelectableAddressInput;
}>;


export type CartDeliveryAddressesAddMutation = { cartDeliveryAddressesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartDeliveryAddressesRemoveMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  addressIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartDeliveryAddressesRemoveMutation = { cartDeliveryAddressesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type GetProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  language?: StorefrontTypes.InputMaybe<StorefrontTypes.LanguageCode>;
  country?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type GetProductsQuery = { products: { pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'>, nodes: Array<(
      Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'productType'>
      & { images: { nodes: Array<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
    )> } };

export type GetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  language?: StorefrontTypes.InputMaybe<StorefrontTypes.LanguageCode>;
  country?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type GetProductByHandleQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'productType' | 'description' | 'descriptionHtml'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, images: { nodes: Array<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }, options: Array<(
      Pick<StorefrontTypes.ProductOption, 'name'>
      & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
    )>, variants: { nodes: Array<(
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
        & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
      )> }, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
  )> };

export type GetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
    & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { edges: Array<{ node: (
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'quantityAvailable'>
            & { product: (
              Pick<StorefrontTypes.Product, 'title' | 'handle'>
              & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
            ), price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'quantityAvailable'>
            & { product: (
              Pick<StorefrontTypes.Product, 'title' | 'handle'>
              & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
            ), price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> }
          ) }
        ) }> } }
  )> };

export type GetCartDeliveryAddressesQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartDeliveryAddressesQuery = { cart?: StorefrontTypes.Maybe<{ delivery: { addresses: Array<Pick<StorefrontTypes.CartSelectableAddress, 'id'>> } }> };

interface GeneratedQueryTypes {
  "#graphql\n  query GetProducts(\n    $first: Int!\n    $after: String\n    $language: LanguageCode\n    $country: CountryCode\n  ) @inContext(language: $language, country: $country) {\n    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      nodes {\n        id\n        title\n        handle\n        productType\n        images(first: 2) {\n          nodes {\n            url\n            altText\n            width\n            height\n          }\n        }\n        priceRange {\n          minVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "#graphql\n  query GetProductByHandle(\n    $handle: String!\n    $language: LanguageCode\n    $country: CountryCode\n  ) @inContext(language: $language, country: $country) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      productType\n      description\n      descriptionHtml\n      featuredImage {\n        url\n        altText\n        width\n        height\n      }\n      images(first: 8) {\n        nodes {\n          url\n          altText\n          width\n          height\n        }\n      }\n      options {\n        name\n        optionValues {\n          name\n        }\n      }\n      variants(first: 50) {\n        nodes {\n          id\n          title\n          availableForSale\n          quantityAvailable\n          selectedOptions {\n            name\n            value\n          }\n          price {\n            amount\n            currencyCode\n          }\n          image {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      priceRange {\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n    }\n  }\n": {return: GetProductByHandleQuery, variables: GetProductByHandleQueryVariables},
  "#graphql\n  query GetCart($cartId: ID!) {\n    cart(id: $cartId) {\n      id\n      checkoutUrl\n      totalQuantity\n      cost {\n        subtotalAmount {\n          amount\n          currencyCode\n        }\n        totalAmount {\n          amount\n          currencyCode\n        }\n      }\n      lines(first: 50) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant {\n                id\n                title\n                quantityAvailable\n                product {\n                  title\n                  handle\n                  featuredImage {\n                    url\n                    altText\n                  }\n                }\n                price {\n                  amount\n                  currencyCode\n                }\n                image {\n                  url\n                  altText\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetCartQuery, variables: GetCartQueryVariables},
  "#graphql\n  query GetCartDeliveryAddresses($cartId: ID!) {\n    cart(id: $cartId) {\n      delivery {\n        addresses {\n          id\n        }\n      }\n    }\n  }\n": {return: GetCartDeliveryAddressesQuery, variables: GetCartDeliveryAddressesQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation CartCreate($input: CartInput!) {\n    cartCreate(input: $input) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n      }\n      userErrors {\n        field\n        message\n      }\n      warnings {\n        code\n        message\n      }\n    }\n  }\n": {return: CartCreateMutation, variables: CartCreateMutationVariables},
  "#graphql\n  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n      }\n      userErrors {\n        field\n        message\n      }\n      warnings {\n        code\n        message\n      }\n    }\n  }\n": {return: CartLinesAddMutation, variables: CartLinesAddMutationVariables},
  "#graphql\n  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartLinesUpdateMutation, variables: CartLinesUpdateMutationVariables},
  "#graphql\n  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        id\n        checkoutUrl\n        totalQuantity\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartLinesRemoveMutation, variables: CartLinesRemoveMutationVariables},
  "#graphql\n  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {\n    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {\n      cart {\n        id\n        checkoutUrl\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartBuyerIdentityUpdateMutation, variables: CartBuyerIdentityUpdateMutationVariables},
  "#graphql\n  mutation CartDeliveryAddressesAdd($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {\n    cartDeliveryAddressesAdd(cartId: $cartId, addresses: $addresses) {\n      cart {\n        id\n        checkoutUrl\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartDeliveryAddressesAddMutation, variables: CartDeliveryAddressesAddMutationVariables},
  "#graphql\n  mutation CartDeliveryAddressesRemove($cartId: ID!, $addressIds: [ID!]!) {\n    cartDeliveryAddressesRemove(cartId: $cartId, addressIds: $addressIds) {\n      cart {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartDeliveryAddressesRemoveMutation, variables: CartDeliveryAddressesRemoveMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
