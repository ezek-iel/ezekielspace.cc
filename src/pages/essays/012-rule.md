---
title: The 012 Rule
author: Ezekiel
date: 2026-08-30
tags:
  - Coding
  - technical
  - Workflows
layout: ../../layouts/postlayout.astro
description: edge cases in DSA problems are very tricky to find and easy to forget
visible: true
---

I have been solving DSA problems for a while now. 

So far, about 70% of the time, my code is usually almost correct until it fails a very set of edge cases.

Let me explain

So imagine you are given a problem to 

```
Insert a node into a sorted singly linked-list
```

Easy right?, I mean we just check each node data, compare them and change the pointers?

```go
func InsertIntoSortedLinkedList(l *LinkedList[int], data int) {

	curr := l.head
	newNode := &Node[int]{data: data}
	
	for curr != nil {
		if curr.next.data > data {
			newNode.next = curr.next
			curr.next = newNode
		return
	}
	
	curr = curr.next
	}

}
```

But we forget important edge cases in this peice of code, like

- What if the node is larger than every node in the list, so it has to be inserted at the end.
- Or more specifically, what if, there is no linkedlist to begin with or the linked list has only one element.

I introduce to you my latest invention[^1]: **The 012 rule**

It's like this

> Given any collection data type and a problem to perform an operation on such data type, always check for when the data type has
> - 0 elements
> - 1 element
> - 2 elements

When I mean check, I usually mean:
- Determine what you intend for your algorithm to do whenever those edge cases occur
- Modify your algorithm to do those things.

So let's re-write the code to fulfill the rule, shall we;

```go
func InsertIntoSortedLinkedList(l *LinkedList[int], data int) {

	newNode := &Node[int]{data: data}
	
	//0 items in the collection
	if l.head == nil {
		l.head = newNode
		return
	}
	
	//This handles 1 item in the collection as well as
	//When the data is smaller than other items in the list
	if l.head.data > data {
		newNode.next = curr
		l.head = newNode
		return
	}
	
	curr := l.head
	
	for curr != nil {		
		if curr.next.data > data {
			newNode.next = curr.next
			curr.next = newNode
			return
		}
		
		curr = curr.next
	}
	
	//This handles 1 item in the collection as well as
	//when the node is bigger than other nodes in the list
	curr.next = newNode
}
```

I've provided the gist to the full [LinkedList](https://gist.github.com/ezek-iel/5d81e880e1f9d32d26b4e7dad96fbbb7) implementation.

Sayonara👋

[^1]: It was actually a result of a random thought ☺️
