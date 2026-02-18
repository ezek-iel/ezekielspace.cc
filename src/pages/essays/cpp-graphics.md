---
title: "Getting Started with Graphics Libraries in C++"
author: "Copilot"
date: 2026-02-18
tags: ["C++", "Graphics Programming", "OpenGL", "SDL2"]
layout: "../../layouts/postlayout.astro"
---

# 🎨 Introduction to Graphics Libraries in C++

Graphics libraries provide the foundation for building **visual applications**, ranging from simple 2D games to complex 3D simulations. In C++, developers often rely on libraries like **OpenGL**, **SDL2**, or **SFML** to handle rendering, input, and window management.

---

## 🔧 Popular Graphics Libraries

- **OpenGL**  
  A cross-platform API for rendering 2D and 3D graphics. It’s widely used in game engines and visualization tools.

- **SDL2 (Simple DirectMedia Layer)**  
  Provides low-level access to audio, keyboard, mouse, and graphics hardware via OpenGL and Direct3D. Great for game development.

- **SFML (Simple and Fast Multimedia Library)**  
  A higher-level library that simplifies graphics, audio, and networking tasks.

---

## 🖥️ Sample C++ Code Using SDL2

Here’s a minimal example of creating a window and drawing a colored rectangle using **SDL2**:

```cpp
#include <SDL2/SDL.h>
#include <iostream>

int main(int argc, char* argv[]) {
    if (SDL_Init(SDL_INIT_VIDEO) < 0) {
        std::cerr << "SDL could not initialize! SDL_Error: " 
                  << SDL_GetError() << std::endl;
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("SDL2 Graphics Example",
                                          SDL_WINDOWPOS_CENTERED,
                                          SDL_WINDOWPOS_CENTERED,
                                          640, 480,
                                          SDL_WINDOW_SHOWN);

    if (!window) {
        std::cerr << "Window could not be created! SDL_Error: " 
                  << SDL_GetError() << std::endl;
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);

    // Main loop flag
    bool quit = false;
    SDL_Event e;

    while (!quit) {
        while (SDL_PollEvent(&e) != 0) {
            if (e.type == SDL_QUIT) {
                quit = true;
            }
        }

        // Clear screen with black
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderClear(renderer);

        // Draw a red rectangle
        SDL_Rect rect = {200, 150, 240, 180};
        SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
        SDL_RenderFillRect(renderer, &rect);

        // Update screen
        SDL_RenderPresent(renderer);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}
