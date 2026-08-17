---
title: "FLIP-ping my animations"
author: "Ezekiel"
date: 2026-02-23
tags: ["Software"]
layout: "../../layouts/postlayout.astro"
description: "FLIP is the most useful web animation technique. Here is a tiny deep dive into how it works in two useful scenarios"
visible: true
---

FLIP is the most famous web animation technique. it is also the most useful. The [original article](https://aerotwist.com/blog/flip-your-animations/) uses `requestAnimationFrame` function in JavaScript, but, I am using the new [Web Animations API (WAAPI)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)

> WAAPI is a JS layer over the CSS animations API.

## Most basic scenario
Lets assume a container that has a group of items, a textbox and a button to add an item to the list. simple stuff!.

By default, the height of the container automatically adjusts to the size of the content.

We can animate this increase in height the FLIP way.

- __F (First)__ - we get the initial height of the element

We add the item to the container. this will increase the height of the container

- __L (Last)__ - we then get the new height

- __I (Invert)__ - we would have to revert the container to it's previous height

- __P (Play)__ - Animate the height of the container from its initial height to the final height.

We would've done the I-P stage in different lines, but, WAAPI already abstracts this for us in a fun way.

```js
// When the list button is clicked
$("#task-button").addEventListener("click", function () {

	//get the initial height of the container
    let initialHeight = $("#task-list").getBoundingClientRect().height
  

	//Create a new list item
    let taskItem = document.createElement("li")
    let textInput = $("#task-input").value
    taskItem.innerText = textInput

	//add the new item to the list
    $("#task-list").appendChild(taskItem)

	//get the updated height
    let finalHeight = $("#task-list").getBoundingClientRect().height
  
	//animate from the initial height to the final height
    $('#task-list').animate([{ height: `${initialHeight}px` }, { height: `${finalHeight}px` }], { duration: 75 })

})
```

Extremely easy. Here is the preview below.  Also note that `$` is the same thing as `document.querySelector`.

<p class="codepen" data-height="300" data-pen-title="Untitled" data-default-tab="html,result" data-slug-hash="PwGYMvg" data-editable="true" data-user="Ezek-iel" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/Ezek-iel/pen/PwGYMvg">
  Untitled</a> by Ezekiel (<a href="https://codepen.io/Ezek-iel">@Ezek-iel</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://public.codepenassets.com/embed/index.js"></script>

## A (slightly) more complicated example.

A more complicated example is in Todo apps. moving an item from one container to another container usually shows the movement animation between containers.

If it might look complex, don't worry, I am here to demystify it for you 😼

> AI couldn't help me with a good code for this.

We have two containers with items. A button click moves the last item from the first container into the last item of the second.

What actually goes on is that 2 arrays of items is being kept. As the button click occurs, the last item of the first array is been removed and added to the second array like this

```js
let undoneTasks = ["Wash the plates", "Play games", "Design Stuff"]
let doneTasks = []

// on button click
const lastItem = undoneTasks[undoneTasks.length - 1]
doneTasks.push(lastItem)
undoneTasks.pop()
```

Which is pretty straightforward.
The whole 2 containers is refreshed all over

```js
function updateUndoneTasks() {
    const list = $("[data-category=undone]")


    list.innerHTML = ""

    undoneTasks.forEach((task) => {
        const listItem = document.createElement("li")
        listItem.innerText = task
        list.appendChild(listItem)
    })
}
```

So how can we FLIP this scenario?

On button click, 
- __F - (First)__ we get the position of the last item at the first container.  
- __L - (Last)__ we then get the position of the newly added item in the second container.    
- I performed the array operations here.  
- __I - (Invert)__ we moved the newly added item to the position of the initial last item.  
- __P - (Play)__ we animated the position from the initial position to the new position.  

I know its confusing, but here is the code to get a better sense of things.

```js
$("#task-button").addEventListener("click", function () {

    const lastItem = undoneTasks[undoneTasks.length - 1]
    doneTasks.push(lastItem)
  
    //Get the last undone list item position
    let lastUndoneItemElement = $('[data-category=undone] li:last-child')
    const { x: xInit, y: yInit } = lastUndoneItemElement.getBoundingClientRect()

    undoneTasks.pop()
    updateUndoneTasks()
    updateDoneTasks()

	//Get the position of the newly added item
    let lastDoneItemElement = $('[data-category=done] li:last-child')
    const { x: xFinal, y: yFinal } = lastDoneItemElement.getBoundingClientRect()
  

	// calculate the difference between the initial and final positions.
    let delta = { x: xFinal - xInit, y: yFinal - yInit }
    

	// animate the last item from the initial to final position
    lastDoneItemElement.animate([{ transform: `translate(${-1 * delta.x}px, ${-1 * delta.y}px)` }, { transform: `translate(0px, 0px)` }], {duration: 300, easing: 'ease-out'})

})
```

Still doesn't make sense right?, 

Here is the preview to play with.

<p class="codepen" data-height="300" data-pen-title="FLIP - movement between containers" data-default-tab="html,result" data-slug-hash="myrdbVo" data-editable="true" data-user="Ezek-iel" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/Ezek-iel/pen/myrdbVo">
  FLIP - movement between containers</a> by Ezekiel (<a href="https://codepen.io/Ezek-iel">@Ezek-iel</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

What can be confusing is as to why we are calculating delta. This is because of how `transform-translate` works. The value you insert is relative to its current position in the browser.

The value being entered is just the initial position.

## In conclusion
This was what I found out when tinkering with FLIP and Web Animations API. Svelte has a `animate:flip` directive for this.

I can't wait to use this in a real world project.
