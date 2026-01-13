package mango

import (
	"fmt"
	"strconv"
	"strings"

	gojson "github.com/coreos/go-json"
	jp "github.com/reclaimprotocol/jsonpathplus-go/v2"
	xp "github.com/reclaimprotocol/xpath-go"
)

type EvaluationError struct {
	Message string
}

func (e EvaluationError) Error() string {
	return e.Message
}

func EvaluateJsonPath(expression string, input string) ([]interface{}, error) {
	results, err := jp.Query(expression, input)

	if err != nil {
		return nil, EvaluationError{
			Message: fmt.Sprintf("reclaimStrings.evaluateJsonPath failed to evaluate expression %q: %v", expression, err),
		}
	}

	if len(results) == 0 {
		return nil, EvaluationError{
			Message: "reclaimStrings.evaluateJsonPath returned no results",
		}
	}

	doc := []byte(input)

	var root gojson.Node
	if err := gojson.Unmarshal(doc, &root); err != nil {
		return nil, EvaluationError{
			Message: fmt.Sprintf("reclaimStrings.evaluateJsonPath failed to parse JSON for offsets: %v", err),
		}
	}

	var resultsValue []interface{}

	for _, result := range results {
		resultMap := make(map[string]interface{}, 10)

		resultMap["index"] = result.Index
		resultMap["original_index"] = result.OriginalIndex
		resultMap["end"] = result.End
		resultMap["start"] = result.Start
		resultMap["length"] = result.Length
		resultMap["path"] = result.Path
		resultMap["parent_property"] = result.ParentProperty

		segments := jsonPathToSegments(result.Path)

		n, keyValueRange, err := findNodeBySegments(doc, &root, segments)
		if err != nil {
			return nil, EvaluationError{
				Message: fmt.Sprintf("reclaimStrings.evaluateJsonPathfailed to resolve path %q: %v", result.Path, err),
			}
		}

		// Use key:value range if available (for object properties), otherwise use node range
		var start, end int
		if keyValueRange != nil {
			// Use the key:value range to match TypeScript behavior
			start = keyValueRange.start
			end = keyValueRange.end
		} else {
			// coreos/go-json Node.Start/End are byte offsets into original doc.
			// End appears to be inclusive; Go slices are exclusive on end → use End+1.
			start = n.Start
			end = n.End + 1
		}

		if start < 0 || end > len(doc) || start > end {
			return nil, EvaluationError{
				Message: fmt.Sprintf("reclaimStrings.evaluateJsonPath invalid range computed for path %q: [%d,%d)", result.Path, start, end),
			}
		}

		resultMap["start_location"] = start
		resultMap["end_location"] = end

		resultsValue = append(resultsValue, resultMap)
	}

	return resultsValue, nil
}

func EvaluateXPath(expression string, input string, contentsOnly bool) ([]interface{}, error) {
	results, err := xp.QueryWithOptions(expression, input, xp.Options{
		IncludeLocation: true,
		OutputFormat:    "nodes",
		ContentsOnly:    contentsOnly,
	})

	if err != nil {
		return nil, EvaluationError{
			Message: err.Error(),
		}
	}

	if len(results) == 0 {
		return nil, EvaluationError{
			Message: "reclaimStrings.evaluateXPath returned no results",
		}
	}

	var resultsValue []interface{}

	for _, result := range results {
		resultMap := make(map[string]interface{}, 10)

		resultMapAttributes := make(map[string]interface{}, len(result.Attributes))
		for k, v := range result.Attributes {
			resultMapAttributes[k] = v
		}
		resultMap["attributes"] = resultMapAttributes
		resultMap["content_end"] = result.ContentEnd
		resultMap["content_start"] = result.ContentStart
		resultMap["end_location"] = result.EndLocation
		resultMap["start_location"] = result.StartLocation
		resultMap["node_name"] = result.NodeName
		resultMap["node_type"] = result.NodeType
		resultMap["path"] = result.Path
		resultMap["text_content"] = result.TextContent
		resultMap["value"] = result.Value

		resultsValue = append(resultsValue, resultMap)
	}

	return resultsValue, nil
}

// jsonPathToSegments converts a JSONPath like $.a[1].b to segments ["a","1","b"].
func jsonPathToSegments(path string) []string {
	p := strings.TrimPrefix(path, "$")
	p = strings.TrimPrefix(p, ".")
	if p == "" {
		return nil
	}
	segments := make([]string, 0)
	cur := strings.Builder{}
	inBracket := false
	for _, r := range p {
		switch r {
		case '.':
			if !inBracket {
				if cur.Len() > 0 {
					segments = append(segments, cur.String())
					cur.Reset()
				}
				continue
			}
		case '[':
			if cur.Len() > 0 {
				segments = append(segments, cur.String())
				cur.Reset()
			}
			inBracket = true
			continue
		case ']':
			if inBracket {
				seg := cur.String()
				cur.Reset()
				inBracket = false
				seg = strings.Trim(seg, "'\"")
				segments = append(segments, seg)
				continue
			}
		}
		cur.WriteRune(r)
	}
	if cur.Len() > 0 {
		segments = append(segments, cur.String())
	}
	return segments
}

// findNodeBySegments walks a coreos/go-json Node tree following the provided segments.
// Returns the target node and information about whether this is the final key in an object
func findNodeBySegments(doc []byte, node *gojson.Node, segments []string) (*gojson.Node, *keyValueRange, error) {
	cur := node
	var finalKeyRange *keyValueRange

	for i, seg := range segments {
		switch v := cur.Value.(type) {
		case map[string]gojson.Node:
			next, ok := v[seg]
			if !ok {
				return nil, nil, fmt.Errorf("object key %q not found at segment %d", seg, i)
			}

			// If this is the final segment, we need to find the key:value range to match TypeScript
			if i == len(segments)-1 {
				keyRange, err := findKeyValueRange(doc, cur, seg, &next)
				if err != nil {
					return nil, nil, fmt.Errorf("failed to find key:value range for %q: %v", seg, err)
				}
				finalKeyRange = keyRange
			}

			cur = &next
		case []gojson.Node:
			idx, err := strconv.Atoi(seg)
			if err != nil {
				return nil, nil, fmt.Errorf("invalid array index %q at segment %d", seg, i)
			}
			if idx < 0 || idx >= len(v) {
				return nil, nil, fmt.Errorf("array index %d out of bounds at segment %d", idx, i)
			}
			cur = &v[idx]
		default:
			return nil, nil, fmt.Errorf("cannot traverse into %T at segment %d", v, i)
		}
	}
	return cur, finalKeyRange, nil
}

type keyValueRange struct {
	start int
	end   int
}

// findKeyValueRange finds the byte range of "key":value in the JSON for the given key
func findKeyValueRange(doc []byte, parentNode *gojson.Node, key string, valueNode *gojson.Node) (*keyValueRange, error) {
	// Search backwards from the value node's start position to find the key
	valueStart := valueNode.Start
	parentStart := parentNode.Start

	// Look for the key pattern within the parent node's range
	keyPattern := fmt.Sprintf("\"%s\"", key)

	// Search backwards from valueStart within the parent range for the key
	searchStart := parentStart
	searchEnd := valueStart

	if searchEnd > len(doc) {
		searchEnd = len(doc)
	}
	if searchStart < 0 {
		searchStart = 0
	}

	searchRegion := doc[searchStart:searchEnd]
	keyIndex := strings.LastIndex(string(searchRegion), keyPattern)

	if keyIndex == -1 {
		// Fallback: estimate based on key length (like before)
		keyWithQuotesAndColon := fmt.Sprintf("\"%s\":", key)
		estimatedKeyStart := valueStart - len(keyWithQuotesAndColon)
		if estimatedKeyStart < parentStart {
			estimatedKeyStart = parentStart
		}
		return &keyValueRange{
			start: estimatedKeyStart,
			end:   valueNode.End + 1,
		}, nil
	}

	// Found the key, return the range from key start to value end
	keyStart := searchStart + keyIndex
	return &keyValueRange{
		start: keyStart,
		end:   valueNode.End + 1,
	}, nil
}
