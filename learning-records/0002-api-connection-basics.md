# Learning Record 0002: API Connection Basics

## Date
2026-06-23

## Context
The user asked how to connect an API while working in the blog project.

## Lesson
Connecting an API in React is a request pipeline: endpoint, request, response check, JSON parsing, state update, and UI states.

## Why it matters
The blog MVP will eventually need a React frontend that reads posts from a Django REST API. The first useful pattern is a small API client plus a page component that handles loading, success, and error states.

## Revisit when
The project adds real DRF endpoints or when the frontend needs category/tag filtering.
