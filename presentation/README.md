# Gezellig Presentation

LaTeX Beamer pitch deck template using the Metropolis theme and the Gezellig visual system.

## Build

Install Tectonic if needed:

```bash
brew install tectonic
```

Compile:

```bash
tectonic presentation/main.tex --outdir presentation/build
```

Render the title slide preview:

```bash
pdftoppm -png -f 1 -singlefile presentation/build/main.pdf presentation/build/title-slide
```

Outputs:

- `presentation/build/main.pdf`
- `presentation/build/title-slide.png`
