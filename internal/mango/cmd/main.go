//go:build js && wasm

package main

import (
	"errors"
	"syscall/js"

	"mango/pkg/mango"
)

func main() {
	reclaimStrings := make(map[string]any, 2)
	js.Global().Set("reclaimStrings", js.ValueOf(reclaimStrings))
	js.Global().Get("reclaimStrings").Set("evaluateJsonPath", js.FuncOf(evaluateJsonPathFunctionJS))
	js.Global().Get("reclaimStrings").Set("evaluateXPath", js.FuncOf(evaluateXPathFunctionJS))
	select {}
}

func completeAsync(callback func() (any, error)) js.Value {
	handler := js.FuncOf(func(this js.Value, args []js.Value) any {
		resolve := args[0]
		reject := args[1]

		go func() {
			data, err := callback()
			if err != nil {
				// err should be an instance of `error`, eg `errors.New("some error")`
				errorConstructor := js.Global().Get("Error")
				errorObject := errorConstructor.New(err.Error())
				reject.Invoke(errorObject)
			} else {
				resolve.Invoke(js.ValueOf(data))
			}
		}()

		return nil
	})

	promiseConstructor := js.Global().Get("Promise")
	return promiseConstructor.New(handler)
}

func evaluateJsonPathFunctionJS(this js.Value, p []js.Value) any {
	return completeAsync(func() (any, error) {
		if len(p) < 2 {
			return nil, errors.New("reclaimStrings.evaluateJsonPath requires 2 arguments: expression, input")
		}

		expression := p[0].String()
		input := p[1].String()

		return mango.EvaluateJsonPath(expression, input)
	})
}

func evaluateXPathFunctionJS(this js.Value, p []js.Value) any {
	return completeAsync(func() (any, error) {
		if len(p) < 3 {
			return nil, errors.New("reclaimStrings.evaluateXPath requires 3 arguments: expression, input, and contentsOnly")
		}

		expression := p[0].String()
		input := p[1].String()
		contentsOnly := p[2].Bool()

		return mango.EvaluateXPath(expression, input, contentsOnly)
	})
}
