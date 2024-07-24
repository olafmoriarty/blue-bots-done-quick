<?php

// THIS FILE IS BASED ON THE TRACERY NODE.JS LIBRARY FOUND HERE:
// https://github.com/v21/tracery/blob/master/tracery.js
// Rudimentarily translated from JavaScript to PHP by me.

class Grammar {
	public $modifiers;
	public $raw;
	public $symbols;
	public $subgrammars;
	public $isRoot;
	public $grammar;
	public $depth;
	public $distribution;
	public $errors;

	function __construct( $raw ) {
		$this->modifiers = [];
		$this->errors = [];
		$this->loadFromRawObj( $raw );

	}

	public function loadFromRawObj( $raw ) {
        $this->raw = $raw;
        $this->symbols = [];
        $this->subgrammars = [];

        if ($this->raw) {
			foreach ($this->raw as $key => $value) {
				if (isset($this->raw[$key])) {
					$this->symbols[$key] = new Symbol( $this, $key, $value );
				}
			}
        }
	}

	public function flatten($rule, $allowEscapeChars = false) {
		$root = $this->expand($rule, $allowEscapeChars);
		return $root->finishedText;
    }

    public function expand($rule, $allowEscapeChars = false) {
        $root = $this->createRoot($rule);
        $root->expand();
        if (!$allowEscapeChars)
            $root->clearEscapeChars();
	
        return $root;
    }

    public function createRoot($rule) {
        // Create a node and subnodes
	    return new TraceryNode($this, 0, [
	        'type' => -1,
	        'raw' => $rule,
	    ]);
    }

    public function selectRule($key, $node, $errors) {
        if ($this->symbols[$key]) {
	        return $this->symbols[$key]->selectRule($node, $errors);
        }

        // Failover to alternative subgrammars
        for ($i = 0; $i < count($this->subgrammars); $i++) {

            if ($this->subgrammars[$i]->symbols[$key])
                return $this->subgrammars[$i]->symbols[$key]->selectRule();
        }

        // No symbol?
        $this->errors[] = "No symbol for '" . $key . "'";
        return "((" . $key . "))";
    }

    function addModifiers($mods) {

        // copy over the base modifiers
        foreach ($mods as $key => $value) {
            if (isset($value)) {
                $this->modifiers[$key] = $value;
            }
        };
    }

	function clearState() {
        $keys = array_keys($this->symbols);
        for ($i = 0; $i < count($keys); $i++) {
            $this->symbols[$keys[$i]]->clearState();
        }
    }

    function toJSON() {
        $keys = array_keys($this->symbols);
        $symbolJSON = [];
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $symbolJSON[] = ' "' . $key . '" : ' . $this->symbols[$key]->rulesToJSON();
        }
        return "{\n" . implode(",\n", $symbolJSON) . "\n}";
    }

    // Create or push rules
    function pushRules($key, $rawRules, $sourceAction) {

        if (!isset($this->symbols[$key])) {
            $this->symbols[$key] = new Symbol($this, $key, $rawRules);
            if ($sourceAction)
                $this->symbols[$key]->isDynamic = true;
        } else {
            $this->symbols[$key]->pushRules($rawRules);
        }
    }

    function popRules($key) {
        if (!isset($this->symbols[$key]) || !$this->symbols[$key])
            $this->errors[] = "Can't pop: no symbol for key " . $key;
        $this->symbols[$key]->popRules();
    }
}

class Symbol {
	public $key;
	public $grammar;
	public $rawRules;
	public $baseRules;
	public $stack;
	public $uses;
	public bool $isDynamic;
	public $errors;

	function __construct( $grammar, $key, $rawRules ) {
        $this->key = $key;
        $this->grammar = $grammar;
        $this->rawRules = $rawRules;

        $this->baseRules = new RuleSet($this->grammar, $rawRules);

		$this->stack = [ $this->baseRules ];
		$this->uses  = [];
		$this->errors = [];
		$this->baseRules->clearState();
	}

	function selectRule($node, $errors) {
        $this->uses[] = ['node' => $node];

        if (count($this->stack) === 0) {
            $errors[] = "The rule stack for '" . $this->key . "' is empty, too many pops?";
            return "((" . $this->key . "))";
        }

        return $this->stack[count($this->stack) - 1]->selectRule();
    }

    public function pushRules($rawRules) {
        $rules = new RuleSet($this->grammar, $rawRules);
        $this->stack[] = $rules;
    }

    public function popRules() {
        array_pop($this->stack);
    }

    public function getActiveRules() {
        if (count($this->stack) === 0) {
            return null;
        }
        return $this->stack[count($this->stack) - 1]->selectRule();
    }

    public function rulesToJSON() {
        return json_encode($this->rawRules);
    }
}

class RuleSet {
	public $raw;
	public $grammar;
	public $falloff;
	public $defaultRules;
	public $defaultUses;
	public $shuffledDeck;
	public $conditionalRule;
	public $ranking;
	public $distribution;
	private $conditionalValues;

	function __construct( $grammar, $raw ) {
		$this->raw = $raw;
		$this->grammar = $grammar;
		$this->falloff = 1;
		
		if (is_array($raw)) {
			$this->defaultRules = $raw;
		}
		elseif (is_string($raw)) {
			$this->defaultRules = [ $raw ];
		}
	}

	function clearState() {
		if ($this->defaultUses) {
			$this->defaultUses = [];
		}
	}

    function selectRule($errors = []) {
        // console.log("Get rule", $this->raw);
        // Is there a conditional?
        if ($this->conditionalRule) {
            $value = $this->grammar->expand($this->conditionalRule, true);
            // does this value match any of the conditionals?
            if ($this->conditionalValues[$value]) {
                $v = $this->conditionalValues[$value]->selectRule($errors);
                if (isset($v))
                    return $v;
            }
            // No returned value?
        }

        // Is there a ranked order?
        if ($this->ranking) {
            for ($i = 0; $i < count($this->ranking); $i++) {
                $v = $this->ranking->selectRule();
                if (isset($v))
                    return $v;
            }

            // Still no returned value?
        }

        if (isset($this->defaultRules)) {
            $index = 0;
            // Select from this basic array of rules

            // Get the distribution from the grammar if there is no other
            $distribution = $this->distribution;
            if (!$distribution)
                $distribution = $this->grammar->distribution;

            switch($distribution) {
            case "shuffle":

                // create a shuffle desk
                if (!$this->shuffledDeck || count($this->shuffledDeck) === 0) {
                    // make an array
					$arr = [];
					for ($i = 0; $i < count($this->defaultRules); $i++) {
						$arr[$i] = $i;
					}
                    $this->shuffledDeck = fyshuffle($arr, $this->falloff);

                }

                $index = array_pop($this->shuffledDeck);

                break;
            case "weighted":
                $errors[] = "Weighted distribution not yet implemented";
                break;
            case "falloff":
                $errors[] = "Falloff distribution not yet implemented";
                break;
            default:
				$random = rand() / getrandmax();
                $index = floor(($random ** $this->falloff) * count($this->defaultRules));
                break;
            }

            if (!$this->defaultUses)
                $this->defaultUses = [];

			$new_index = isset($this->defaultUses[$index]) ? ++$this->defaultUses[$index] : 1;
            return $this->defaultRules[$index];
        }

        $errors[] = "No default rules defined for " . $this;
        return null;

    }

}


class Tracery {
	public function baseEngModifiers() {
		return [

			'replace' => function( $s, $params ) {
				return str_replace(escapeRegExp($params[0]), $params[1], $s);
			},

			'capitalizeAll' => function($s) {
				$s2 = "";
				$capNext = true;
				for ($i = 0; $i < strlen($s); $i++) {

					if (!isAlphaNum($s[$i])) {
						$capNext = true;
						$s2 .= $s[$i];
					} else {
						if (!$capNext) {
							$s2 .= $s[$i];
						} else {
							$s2 .= strtoupper($s[$i]);
							$capNext = false;
						}

					}
				}
				return $s2;
			},

			'capitalize' => function($s) {
				return ucfirst($s);
			},

			'a' => function($s) {
				if (strlen($s) > 0) {
					if (strtolower($s[0]) === 'u') {
						if (strlen($s) > 2) {
							if (strtolower($s[2]) === 'i')
								return "a " . $s;
						}
					}

					if (isVowel($s[0])) {
						return "an " . $s;
					}
				}

				return "a " . $s;

			},

			'firstS' => function($s) {
				$s2 = explode(' ', $s);
				return $this->baseEngModifiers()['s']($s2[0]) . " " . implode(' ', array_slice($s2, 1));
			},

			's' => function($s) {
				switch ($s[strlen($s) - 1]) {
				case 's':
				case 'h':
				case 'x':
					return $s . "es";
				case 'y':
					if (!isVowel($s[strlen($s) - 2]))
						return substr($s, 0, strlen($s) - 1) . "ies";
					else
						return $s . "s";
				default:
					return $s . "s";
				}
			},
			'ed' => function($s) {
				switch ($s[strlen($s) - 1]) {
				case 'e':
					return $s . "d";
				case 'y':
					if (!isVowel($s[strlen($s) - 2]))
						return substr($s, 0, strlen($s) - 1) . "ied";
					else
						return $s . "d";
				default:
					return $s . "ed";
				}
			}
		];
	}

	public function createGrammar( $raw ) {
		return new Grammar( $raw );
	}
}

function escapeRegExp($str) {
	return preg_replace('/([.*+?^=!:${}()|\[\]\/\\\])/', "\\$1", $str);
}

function isAlphaNum($c) {
	return ($c >= 'a' && $c <= 'z') || ($c >= 'A' && $c <= 'Z') || ($c >= '0' && $c <= '9');
}

function isVowel($c) {
	$c2 = strtolower($c);
	return ($c2 === 'a') || ($c2 === 'e') || ($c2 === 'i') || ($c2 === 'o') || ($c2 === 'u');
}

class TraceryNode {

	public $errors = [];

	public $grammar;
	public $parent;
	public $childIndex;
	public $settings;
	public $depth;
	public $raw;
	public $type;
	public $isExpanded;
	public $expansionErrors;
	public $children;
	public $finishedText;
	public $childRule;
	public $preactions;
	public $postactions;
	public $symbol;
	public $modifiers;
	
	public function __construct( $parent, $childIndex, $settings ) {
		if (!isset($settings)) {
			$settings = [];
		}

		if (!isset($settings['raw'])) {
			$this->errors[] = 'Empty input for node';
			$settings['raw'] = '';
		}

		if (get_class($parent) === 'Grammar') {
			$this->grammar = $parent;
			$this->parent = null;
			$this->depth = 0;
			$this->childIndex = 0;			
		}
		else {
			$this->grammar = $parent->grammar;
			$this->parent = $parent;
			$this->depth = $parent->depth + 1;
			$this->childIndex = $childIndex;
		}

		$this->raw = $settings['raw'];
		if (isset($settings['type'])) {
			$this->type = $settings['type'];
		}
		$this->isExpanded = false;

		if (!$this->grammar) {
			$this->errors[] = "No grammar specified for this node";
		}
	}

	public function toString() {
		return "Node('" . $this->raw . "' " . $this->type . " d:" . $this->depth . ")";
	}

	public function expand($preventRecursion = false) {
		if (!$this->isExpanded) {
            $this->isExpanded = true;

            $this->expansionErrors = [];

			// Types of nodes
            // -1: raw, needs parsing
            //  0: Plaintext
            //  1: Tag ("#symbol.mod.mod2.mod3#" or "#[pushTarget:pushRule]symbol.mod")
            //  2: Action ("[pushTarget:pushRule], [pushTarget:POP]", more in the future)

			switch($this->type) {
            // Raw rule
            case -1:

                $this->expandChildren($this->raw, $preventRecursion);
				break;

            // plaintext, do nothing but copy text into finsihed text
            case 0:
                $this->finishedText = $this->raw;
                break;

            // Tag
            case 1:
                // Parse to find any actions, and figure out what the symbol is
                $this->preactions = [];
                $this->postactions = [];

                $parsed = tracery_parseTag($this->raw);

                // Break into symbol actions and modifiers
                $this->symbol = $parsed['symbol'];
                $this->modifiers = $parsed['modifiers'];

                // Create all the preactions from the raw syntax
                for ($i = 0; $i < count($parsed['preactions']); $i++) {
                    $this->preactions[$i] = new NodeAction($this, $parsed['preactions'][$i]['raw']);
                }
                for ($i = 0; $i < count($parsed['postactions']); $i++) {
                    //   $this->postactions[i] = new NodeAction(this, parsed.postactions[i].raw);
                }

                // Make undo actions for all preactions (pops for each push)
                for ($i = 0; $i < count($this->preactions); $i++) {
                    if ($this->preactions[$i]->type === 0)
                        $this->postactions[] = $this->preactions[$i]->createUndo();
                }

                // Activate all the preactions
                for ($i = 0; $i < count($this->preactions); $i++) {
                    $this->preactions[$i]->activate();
                }

                $this->finishedText = $this->raw;

                // Expand (passing the node, this allows tracking of recursion depth)

                $selectedRule = $this->grammar->selectRule($this->symbol, $this, $this->errors);

                $this->expandChildren($selectedRule, $preventRecursion);

                // Apply modifiers
                // TODO: Update parse function to not trigger on hashtags within parenthesis within tags,
                //   so that modifier parameters can contain tags "#story.replace(#protagonist#, #newCharacter#)#"
                for ($i = 0; $i < count($this->modifiers); $i++) {
                    $modName = $this->modifiers[$i];
                    $modParams = [];
                    if (strpos($modName, '(') > 0) {
                        $regExp = '/\(([^)]+)\)/';

                        // Todo: ignore any escaped commas.  For now, commas always split
                        preg_match($regExp, $this->modifiers[$i], $results);
                        if (!$results || count($results) < 2) {
                        } else {
                            $modParams = explode(',', $results[1]);
                            $modName = substr( $this->modifiers[$i], 0, strpos($modName, '('));
                        }

                    }

                    // Missing modifier?
                    if (!isset($this->grammar->modifiers[$modName])) {
                        $this->errors[] = "Missing modifier " . $modName;
                        $this->finishedText .= "((." . $modName . "))";
                    } else {
                        $this->finishedText = $this->grammar->modifiers[$modName]($this->finishedText, $modParams);

                    }

                }

                // Perform post-actions
                for ($i = 0; $i < count($this->postactions); $i++) {
                    $this->postactions[$i]->activate();
                }
                break;
            case 2:

                // Just a bare action?  Expand it!
                $action = new NodeAction($this, $this->raw);
                $action->activate();

				// No visible text for an action
                // TODO: some visible text for if there is a failure to perform the action?
                $this->finishedText = "";
                break;

            }

        } else {
            //console.warn("Already expanded " + this);
        }

    }

	    // Expand the node (with the given child rule)
    //  Make children if the node has any
    public function expandChildren($childRule, $preventRecursion) {
        $this->children = [];
        $this->finishedText = "";
        // Set the rule for making children,
        // and expand it into section
        $this->childRule = $childRule;
        if (isset($this->childRule)) {
            $sections = tracery_parse($childRule);

            // Add errors to this
            if (count($sections['errors']) > 0) {
                $this->errors = array_merge($this->errors, $sections['errors']);
            }

            for ($i = 0; $i < count($sections); $i++) {
				if (!isset($sections[$i])) {
					continue;
				}
				$this->children[$i] = new TraceryNode($this, $i, $sections[$i]);
                if (!$preventRecursion)
                    $this->children[$i]->expand($preventRecursion);

                // Add in the finished text
                $this->finishedText .= $this->children[$i]->finishedText;
            }
        } else {
            // In normal operation, this shouldn't ever happen
            $this->errors[] = "No child rule provided, can't expand children";
        }
    }

	public function clearEscapeChars() {
		$ft = $this->finishedText;
		$ft = str_replace( '\\\\', 'DOUBLEBACKSLASH', $ft);
		$ft = str_replace( '\\', '', $ft);
		$ft = str_replace('DOUBLEBACKSLASH', '\\', $ft);
        $this->finishedText = $ft;
    }
}

function createSection($start, $end, $type, &$rule, &$errors, &$lastEscapedChar, &$escapedSubstring, &$sections) {
	if ($end - $start < 1) {
		if ($type === 1)
			$errors[] = $start . ": empty tag";
		if ($type === 2)
			$errors[] = $start . ": empty action";
	}
	$rawSubstring = '';
	if ($lastEscapedChar !== null) {
		$rawSubstring = $escapedSubstring . "\\" . substr($rule, $lastEscapedChar + 1, $end - ($lastEscapedChar + 1));
	} else {
		$rawSubstring = substr($rule, $start, $end - $start);
	}
	$sections[] = [
		'type' => $type,
		'raw' => $rawSubstring,
	];

	$lastEscapedChar = null;
	$escapedSubstring = "";
};

function tracery_parse($rule) {
	$depth = 0;
	$inTag = false;
	$sections = [];
	$escaped = false;

	$errors = [];
	$start = 0;

	$escapedSubstring = "";
	$lastEscapedChar = null;

	if ($rule === null) {
		$sections['errors'] = $errors;
		return $sections;
	}

	for ($i = 0; $i < strlen($rule); $i++) {

		if (!$escaped) {
			$c = $rule[$i];

			switch($c) {

			// Enter a deeper bracketed section
			case '[':
				if ($depth === 0 && !$inTag) {
					if ($start < $i)
						createSection($start, $i, 0, $rule, $errors, $lastEscapedChar, $escapedSubstring, $sections);
					$start = $i + 1;
				}
				$depth++;
				break;

			case ']':
				$depth--;

				// End a bracketed section
				if ($depth === 0 && !$inTag) {
					createSection($start, $i, 2, $rule, $errors, $lastEscapedChar, $escapedSubstring, $sections);
					$start = $i + 1;
				}
				break;

			// Hashtag
			//   ignore if not at depth 0, that means we are in a bracket
			case '#':
				if ($depth === 0) {
					if ($inTag) {
						createSection($start, $i, 1, $rule, $errors, $lastEscapedChar, $escapedSubstring, $sections);
						$start = $i + 1;
					} else {
						if ($start < $i)
							createSection($start, $i, 0, $rule, $errors, $lastEscapedChar, $escapedSubstring, $sections);
						$start = $i + 1;
					}
					$inTag = !$inTag;
				}
				break;

			case '\\':
				$escaped = true;
				$escapedSubstring .= substr($rule, $start, $i);
				$start = $i + 1;
				$lastEscapedChar = $i;
				break;
			}
		} else {
			$escaped = false;
		}
	}
	if ($start < strlen($rule))
		createSection($start, strlen($rule), 0, $rule, $errors, $lastEscapedChar, $escapedSubstring, $sections);

	if ($inTag) {
		$errors[] = "Unclosed tag";
	}
	if ($depth > 0) {
		$errors[] = "Too many [";
	}
	if ($depth < 0) {
		$errors[] = "Too many ]";
	}

	// Strip out empty plaintext sections
	$new_sections = [];
	for ($i = 0; $i < count($sections); $i++) {
		if ($sections[$i]['type'] === 0 && strlen($sections[$i]['raw']) === 0) {
		}
		else {
			$new_sections[] = $sections[$i];
		}
	}
	$sections = $new_sections;
	$sections['errors'] = $errors;
	return $sections;
}

// Parse the contents of a tag
function tracery_parseTag($tagContents) {

	$parsed = [
		'symbol' => null,
		'preactions' => [],
		'postactions' => [],
		'modifiers' => []
	];
	$sections = tracery_parse($tagContents);
	$symbolSection = null;
	for ($i = 0; $i < count($sections); $i++) {
		if (!isset($sections[$i])) {
			continue;
		}
		if ($sections[$i]['type'] === 0) {
			if ($symbolSection === null) {
				$symbolSection = $sections[$i]['raw'];
			} else {
				// throw ("multiple main sections in " + tagContents);
			}
		} else {
			$parsed['preactions'][] = $sections[$i];
		}
	}

	if ($symbolSection === null) {
		//   throw ("no main section in " + tagContents);
	} else {
		$components = explode('.', $symbolSection);
		$parsed['symbol'] = $components[0];
		$parsed['modifiers'] = array_slice($components, 1);
	}
	return $parsed;
}

// An action that occurs when a node is expanded
// Types of actions:
// 0 Push: [key:rule]
// 1 Pop: [key:POP]
// 2 function: [functionName(param0,param1)] (TODO!)
class NodeAction {
	
	// if (!node)
	// console.warn("No node for NodeAction");
	// if (!raw)
	// console.warn("No raw commands for NodeAction");

	public $node;
	public $target;
	public $rule;
	public $type;
	public $ruleSections;
	public $finishedRules;
	public $ruleNodes;

	function __construct($node, $raw) {
		$this->node = $node;
		$sections = explode(':', $raw);
		$this->target = $sections[0];

		if (count($sections) === 1) {
			$this->type = 2;

		}
		else {
			$this->rule = $sections[1];
			if ($this->rule === "POP") {
				$this->type = 1;
			} else {
				$this->type = 0;
			}
	
		}
	}

	public function activate() {
        $grammar = $this->node->grammar;
        switch ($this->type) {
        case 0:
            // split into sections (the way to denote an array of rules)
            $this->ruleSections = explode(',', $this->rule);
            $this->finishedRules = [];
            $this->ruleNodes = [];
            for ($i = 0; $i < count($this->ruleSections); $i++) {
                $n = new TraceryNode($grammar, 0, [
                    'type' => -1,
                    'raw' => $this->ruleSections[$i]
                ]);

                $n->expand();

                $this->finishedRules[] = $n->finishedText;
            }

            // TODO: escape commas properly
            $grammar->pushRules($this->target, $this->finishedRules, $this);
            break;
        case 1:
            $grammar->popRules($this->target);
            break;
        case 2:
            $grammar->flatten($this->target, true);
            break;
        }
    }

	public function createUndo() {
        if ($this->type === 0) {
            return new NodeAction($this->node, $this->target . ":POP");
        }
        // TODO Not sure how to make Undo actions for functions or POPs
        return null;
    }

    public function toText() {
        switch($this->type) {
        case 0:
            return $this->target . ":" . $this->rule;
        case 1:
            return $this->target . ":POP";
        case 2:
            return "((some function))";
        default:
            return "((Unknown Action))";
        }
    }
}

function fyshuffle($array, $falloff) {
	$currentIndex = count($array);
	$temporaryValue = 0;
	$randomIndex = 0;

	// While there remain elements to shuffle...
	while (0 !== $currentIndex) {

		// Pick a remaining element...
		$random = rand() / getrandmax();

		$randomIndex = floor($random * $currentIndex);
		$currentIndex--;

		// And swap it with the current element.
		$temporaryValue = $array[$currentIndex];
		$array[$currentIndex] = $array[$randomIndex];
		$array[$randomIndex] = $temporaryValue;
	}

	return $array;
}
