import { gql } from '@apollo/client';

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  date: string;
}

export const EVENTS_QUERY = gql`
  query Events {
    events {
      _id
      title
      description
      price
      date
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: EventInput!) {
    createEvent(eventInput: $input) {
      _id
      title
      description
      price
      date
    }
  }
`;

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
