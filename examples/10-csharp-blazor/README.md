# Example 10 — C# / .NET in the WebAssembly World

.NET's Wasm story has three paths. **Path 1 ships here as a real, minimal
project** (`BlazorExample/`) — built and asserted in CI on both OSes.
Paths 2 and 3 are copy-paste guides: they need SDKs beyond plain .NET
(the external WASI SDK for AOT; the wasmCloud toolchain), so they stay as
documented commands rather than half-working skeletons.

## Path 1 — Blazor WebAssembly (real project, CI-verified)

`BlazorExample/` is a hand-minimized Blazor WebAssembly SPA — the five files
that matter, without the `dotnet new blazorwasm` template's boilerplate:

```
BlazorExample/
├── BlazorExample.csproj     Microsoft.NET.Sdk.BlazorWebAssembly, packages 10.0.15
├── Program.cs               WebAssemblyHostBuilder — mounts App into #app
├── App.razor                the page markup, renders <Counter />
├── Counter.razor            the counter below — C# driving the DOM
└── wwwroot/index.html       static host page loading _framework/blazor.webassembly.js
```

```bash
bash build.sh      # dotnet publish → dist/ (self-contained static bundle)
node test.mjs      # asserts the bundle's real artifacts
# local run with the DevServer instead:
cd BlazorExample && dotnet run
```

`test.mjs` verifies three layers of the publish output:

1. the host page mounts `#app`;
2. **the .NET runtime itself is a Wasm module** — `dotnet.native.<hash>.wasm`,
   checked byte-for-byte for the `\0asm` magic;
3. **your C# assembly arrives as Wasm too** — .NET 10's publish layout emits
   every managed assembly as a hashed `.wasm` file
   (`BlazorExample.<hash>.wasm`), i.e. your C# literally compiles to
   WebAssembly modules the runtime loads at startup.

An SPA framework: the **entire .NET runtime ships to the browser**, you write
UI in C#, and the DOM is driven from Wasm memory. The cost: ~5–10 MB first
download (reduced by AOT + trimming).

The counter component (verbatim from `Counter.razor`):

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

.NET 9/10 can Native-AOT-compile to the `wasi-wasm` RID: container/edge
scenarios.

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

> **Note:** the AOT publish requires the external **WASI SDK**
> (`WASI_SDK_PATH` pointing at a wasi-sdk release) in addition to the .NET
> SDK — that is why this path is a guide here rather than a CI-verified
> project. The interpreter (non-AOT) `wasi-wasm` publish works with the .NET
> SDK alone.

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
- .NET 10 recommends the `wasm-tools` workload for optimized Blazor builds (`dotnet workload install wasm-tools`) — this example stays SDK-only on purpose.
