/**
 * Typed Customer Account API documents.
 *
 * Every field rendered or written by an account route goes through the exact
 * pinned Customer Account schema. Reads live in `account-view.ts`; the address
 * mutations are driven from `addresses.ts` behind a Server Action boundary.
 *
 * The mutation payloads deliberately select `userErrors { code field }` and
 * never `message`: a provider-authored string must not be able to reach a
 * rendered page, an RSC payload, or a log line.
 */

import { gql } from "@shopify/hydrogen/customer-account";

/** Bounded page sizes. Account routes never paginate beyond these. */
export const ACCOUNT_ORDER_LIMIT = 20;
export const ACCOUNT_RECENT_ORDER_LIMIT = 5;
export const ACCOUNT_ADDRESS_LIMIT = 10;
export const ORDER_LINE_LIMIT = 50;

export const ACCOUNT_PROFILE_QUERY = gql(`#graphql
  query ForwardAccountProfile($orderCount: Int!, $addressCount: Int!) {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      defaultAddress {
        id
        formatted(withName: true)
      }
      addresses(first: $addressCount) {
        nodes {
          id
          formatted(withName: true)
        }
      }
      orders(first: $orderCount, reverse: true, sortKey: PROCESSED_AT) {
        nodes {
          id
          name
          number
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

/**
 * Editable address fields, read only by the addresses page so an edit form is
 * pre-filled with the stored values rather than blanking them on save.
 */
export const ACCOUNT_ADDRESSES_QUERY = gql(`#graphql
  query ForwardAccountAddresses($addressCount: Int!) {
    customer {
      defaultAddress {
        id
      }
      addresses(first: $addressCount) {
        nodes {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          zoneCode
          zip
          territoryCode
          phoneNumber
          formatted(withName: true)
        }
      }
    }
  }
`);

export const ACCOUNT_ADDRESS_CREATE_MUTATION = gql(`#graphql
  mutation ForwardAccountAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean!) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
      }
    }
  }
`);

/**
 * Also carries "make this the default address": the pinned schema has no
 * separate default-address mutation, only this argument.
 */
export const ACCOUNT_ADDRESS_UPDATE_MUTATION = gql(`#graphql
  mutation ForwardAccountAddressUpdate($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
      }
      userErrors {
        code
        field
      }
    }
  }
`);

export const ACCOUNT_ADDRESS_DELETE_MUTATION = gql(`#graphql
  mutation ForwardAccountAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        code
        field
      }
    }
  }
`);

export const ACCOUNT_ORDER_LOOKUP_QUERY = gql(`#graphql
  query ForwardAccountOrderLookup($query: String!) {
    customer {
      orders(first: 2, query: $query) {
        nodes {
          id
          number
        }
      }
    }
  }
`);

export const ACCOUNT_ORDER_QUERY = gql(`#graphql
  query ForwardAccountOrder($orderId: ID!, $lineCount: Int!) {
    order(id: $orderId) {
      id
      name
      number
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      subtotal {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      shippingAddress {
        id
        formatted(withName: true)
      }
      lineItems(first: $lineCount) {
        nodes {
          id
          title
          variantTitle
          quantity
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);
