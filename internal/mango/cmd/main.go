//go:build js && wasm

package main

import (
	"syscall/js"

	"mango/pkg/mango"
)

func main() {
	reclaimStrings := make(map[string]interface{}, 2)
	js.Global().Set("reclaimStrings", js.ValueOf(reclaimStrings))
	js.Global().Get("reclaimStrings").Set("evaluateJsonPath", js.FuncOf(evaluateJsonPathFunctionJS))
	js.Global().Get("reclaimStrings").Set("evaluateXPath", js.FuncOf(evaluateXPathFunctionJS))
	select {}
}

func evaluateJsonPathFunctionJS(this js.Value, p []js.Value) interface{} {
	if len(p) < 2 {
		return js.Global().Get("Error").New("reclaimStrings.evaluateJsonPath requires 2 arguments: expression, input")
	}

	expression := p[0].String()
	input := p[1].String()

	resultsValue, err := mango.EvaluateJsonPath(expression, input)
	if err != nil {
		return js.Global().Get("Error").New(err.Error())
	}

	return js.ValueOf(resultsValue)
}

func evaluateXPathFunctionJS(this js.Value, p []js.Value) interface{} {
	if len(p) < 3 {
		return js.Global().Get("Error").New("reclaimStrings.evaluateXPath requires 3 arguments: expression, input, and contentsOnly")
	}

	expression := p[0].String()
	input := p[1].String()
	contentsOnly := p[2].Bool()

	resultsValue, err := mango.EvaluateXPath(expression, input, contentsOnly)
	if err != nil {
		return js.Global().Get("Error").New(err.Error())
	}

	return js.ValueOf(resultsValue)
}
