# Example 10 — C# / .NET in the WebAssembly World

.NET's Wasm story has two main paths. Instead of heavy project skeletons, this folder provides **copy-paste commands and a decision guide** (both paths start from a single `dotnet new` command).

## Path 1 — Blazor WebAssembly (the most common)

An SPA framework: the **entire .NET runtime ships to the browser**, you write UI in C#, and the DOM is driven from Wasm memory.

```bash
dotnet new blazorwasm -o BlazorExample
cd BlazorExample
dotnet run
# → a full C# SPA on https://localhost:xxxx
```

When: the team is C#, and you want UI + business logic in the browser. The cost: ~5–10 MB first download (reduced by AOT + trimming).

A sample component (the counter ships with the template — `Counter.razor`):

```razor
@page "/counter"
<button @onclick="Increment">Click me</button>
<p>Count: @count</p>

@code {
    private int count = 0;
    private void Increment() => count++;   // this C# runs in the browser as Wasm
}
```

## Path 2 — Native AOT + WASI (outside the browser, small output)

.NET 9/10 can Native-AOT-compile to the `wasi-wasm` RID: container/edge scenarios.

```bash
dotnet new console -o WasiExample
cd WasiExample
# add to the csproj:
#   <RuntimeIdentifier>wasi-wasm</RuntimeIdentifier>
#   <PublishAot>true</PublishAot>
dotnet publish
# output: bin/Release/net10.0/wasi-wasm/publish/App.wasm
wasmtime run App.wasm
```

## Path 3 — wasmCloud / the Component Model

Writing Wasm **components** in C# for distributed systems: see the [`wasmCloud`](https://wasmcloud.com/docs) .NET SDK for actor/component development — isolated server-side service units.

## Decision guide

| Need | Path |
|---|---|
| A C# SPA in the browser | Blazor WebAssembly |
| A small, isolated .NET unit on the server | Native AOT + WASI |
| A language-agnostic service in a distributed system | wasmCloud component |
| Exposing an existing .NET library to JS | Blazor or Native AOT + JS interop |

## Watch out for

- Blazor's first download is large → use AOT (`<RunAOTCompilation>true`) and trimming.
- The JS interop bridge (`IJSRuntime`) — every DOM call crosses the bridge; the "batch your calls" rule from the Rust example applies here too.
- The WASI/Native AOT path is still maturing (WASI 0.3 integration in progress); Blazor is the most production-safe choice today.
