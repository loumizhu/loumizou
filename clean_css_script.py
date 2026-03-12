
import re

def clean_css(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Simple tokenizer/parser
    # We want to remove rulesets where the selector contains .mega-menu-megamenu or mega-menu-columns
    # We must respect @media blocks (don't remove the @media wrapper itself unless empty, but removing rules inside it).
    
    # Approach:
    # 1. Iterate through the file char by char.
    # 2. Build up a buffer for "current context" (selector or @media declaration).
    # 3. When we hit '{', check if the buffer looks like a @media or a selector.
    #    - If @media, increment nesting level, keep the line.
    #    - If selector, check if it is "bad". 
    #      - If "bad", enter "skip mode" until matching '}'.
    #      - If "good", keep it and print to output.
    
    output = []
    i = 0
    length = len(content)
    
    # Stack to track nesting
    # Each item: {'type': 'media' or 'rule' or 'skip', 'start_index': int}
    stack = []
    
    input_buffer = ""
    
    # This state machine is tricky with buffering. 
    # Alternative: Use a regex to splitting is safer if we assume standard formatting.
    # But nested braces in @media make regex hard.
    
    # Let's try a simpler approach: 
    # Since the file is reasonably well formatted (mostly), we can process it by blocks if we are careful.
    # But let's verify the nesting.
    # The file has:
    # @media ... {
    #    selector { ... }
    # }
    # Max depth seems to be 2 (media -> rule).
    
    result = []
    cursor = 0
    
    while cursor < length:
        # Find next '{'
        try:
            next_brace = content.index('{', cursor)
        except ValueError:
            # No more braces, just append the rest
            result.append(content[cursor:])
            break
            
        pre_text = content[cursor:next_brace]
        
        # Check if pre_text contains @media
        if "@media" in pre_text:
            # This is a media block start. Keep it.
            result.append(pre_text + '{')
            cursor = next_brace + 1
            
            # Now we are inside a media query. We need to process rules inside it until the matching '}'.
            # We need to find the matching closing brace for this @media block to limit our scope, 
            # OR we can just continue processing recursively?
            # Let's just create a function to process a block of text.
            continue
            
        else:
            # exact logic for regular rules
            # Find the matching closing '}' for this rule
            # Note: A rule inside might contain stripped chars, but CSS rules usually don't contain { } inside values except for some edge cases (content: "{").
            # Assuming standard CSS for this file.
            
            # Find close brace
            close_brace = -1
            balance = 1
            search_pos = next_brace + 1
            while balance > 0 and search_pos < length:
                char = content[search_pos]
                if char == '{':
                    balance += 1
                elif char == '}':
                    balance -= 1
                search_pos += 1
            
            if balance == 0:
                close_brace = search_pos - 1
                rule_body = content[next_brace:close_brace+1]
                full_rule = pre_text + rule_body
                
                # Check selector (pre_text) for unwanted terms
                # Note: pre_text might include closing brace of previous rule if we are not careful? 
                # No, we append result and move cursor.
                # However, pre_text might capture newlines or comments. 
                
                # Clean up selector for checking
                selector_check = pre_text.strip()
                # Remove comments from selector check
                selector_check = re.sub(r'/\*.*?\*/', '', selector_check, flags=re.DOTALL)
                
                if ((".mega-menu-megamenu" in selector_check) or 
                    ("mega-menu-columns" in selector_check) or 
                    ("mega-menu-row" in selector_check)):
                    # SKIP this rule
                    # But we might need to preserve the whitespace/newlines before it?
                    # Usually fine to skip.
                    pass 
                else:
                    result.append(full_rule)
                
                cursor = close_brace + 1
            else:
                # Unbalanced?
                result.append(content[cursor:])
                break

    # Re-assemble
    # Wait, the above logic is flawed for nested @media blocks.
    # If we hit @media, we just appended it and moved cursor past '{'.
    # Then the next loop will find the next '{' which is a rule inside the media query.
    # Logic works for nested structure if we treat @media open as just a string.
    # BUT, when we decide to SKIP a rule via 'selector check', we seek to the closing '}'.
    # If we are inside an @media block, and we hit the closing '}' of the @media block, 
    # the code above might think it's the closing brace of a rule if we misidentified the start.
    
    # Correct approach needed:
    # Scan through, counting braces.
    
    final_output = []
    i = 0
    buffer = ""
    
    # Simple brace counter state machine
    depth = 0
    
    # We want to identify the "Selector" part.
    # Selector is everything from (start of file OR last '}' OR last '{' if depth increase) up to current '{'.
    
    start_of_segment = 0
    
    while i < len(content):
        char = content[i]
        
        if char == '{':
            # End of a selector/declaration-start
            selector_text = content[start_of_segment:i]
            
            if "@media" in selector_text:
                # It's a media query, keep it, increase depth
                # We don't filter media queries themselves, only rules inside them.
                depth += 1
            else:
                # It's a rule (or nested something else). 
                # Note: If depth is 0, it's a top level rule.
                # If depth is 1, it's a rule inside media query (most likely).
                
                # Check if this selector is bad
                # We only want to filter regular rules, not @media lines.
                
                is_bad = False
                # Remove comments for check
                clean_sel = re.sub(r'/\*.*?\*/', '', selector_text, flags=re.DOTALL)
                if (".mega-menu-megamenu" in clean_sel or 
                    "mega-menu-columns" in clean_sel or 
                    "mega-menu-row" in clean_sel):
                    is_bad = True
                
                if is_bad:
                    # We want to skip this block.
                    # We need to find the matching '}' and advance 'start_of_segment' to after it.
                    # We also need to handle nested braces inside this bad block (e.g. if content: "{")
                    
                    # Advance to matching }
                    temp_depth = 1
                    j = i + 1
                    while j < len(content) and temp_depth > 0:
                        if content[j] == '{':
                            temp_depth += 1
                        elif content[j] == '}':
                            temp_depth -= 1
                        j += 1
                    
                    # content[start_of_segment:j] is the bad block.
                    # We DO NOT add it to final_output.
                    # We explicitly overwrite `start_of_segment` to exclude this block.
                    
                    # However, we must preserve what came before start_of_segment if we were buffering?
                    # No, we haven't written anything to simple buffer yet.
                    # Wait, we need to write "good" stuff.
                    
                    if start_of_segment > 0:
                        # We might have skipped stuff?
                        # No, we only want to write non-skipped stuff.
                        # This logic is non-linear.
                        pass
                        
                    start_of_segment = j
                    i = j - 1 # loop will increment
                    
                else:
                    # Good block (or @media block start)
                    # Wait, if it was @media, we handled it above. 
                    # If it's a good rule, we just continue!
                    # We don't need to do anything special at '{', just let the loop continue?
                    # NO. If we don't output, we need to know when TO output.
                    
                    # Better design: 
                    # Always append to a buffer. If we find a bad block, we TRUNCATE the buffer back to start_of_segment?
                    pass
                    depth += 1

        elif char == '}':
            depth -= 1
            
        i += 1
        
    # Rethink:
    # Use re.split to separate by `{` and `}` is too messy.
    # The "skip bad block" approach requires us to identify "bad selector" at the moment of `{`.
    
    # New algo:
    # 1. Keep a `write_ptr`.
    # 2. Iterate `read_ptr`.
    # 3. Identify boundaries.
    
    clean_content = ""
    last_pos = 0
    i = 0
    current_depth = 0
    
    while i < len(content):
        if content[i] == '{':
            # Look behind to see selector
            # We search backwards from i-1 to find where this selector started.
            # It started after the last '}' or '{' or start of file.
            # Actually, `last_pos` tracks exactly that point (end of previous block).
            
            selector = content[last_pos:i]
            
            # Check if @media
            if "@media" in selector:
                current_depth += 1
                # Keep processing
            else:
                # Regular rule
                clean_sel = re.sub(r'/\*.*?\*/', '', selector, flags=re.DOTALL)
                if (".mega-menu-megamenu" in clean_sel or 
                    "mega-menu-columns" in clean_sel or 
                    "mega-menu-row" in clean_sel):
                    
                    # It is BAD. 
                    # 1. Commit everything up to `last_pos` (if not already done? No, we need to be appending incrementally).
                    # Actually, we should store "valid ranges".
                    
                    clean_content += content[last_pos:last_pos] # Effectively nothing if we build continuously
                    # BUT `clean_content` already has everything up to `last_pos` if we append after each block?
                    
                    # Let's simple append:
                    # We have `clean_content` containing everything valid up to `last_pos`.
                    # Now we have a bad block from `last_pos` to `closing_brace`.
                    
                    # Find closing brace
                    temp_depth = 1
                    j = i + 1
                    while j < len(content) and temp_depth > 0:
                        if content[j] == '{':
                            temp_depth += 1
                        elif content[j] == '}':
                            temp_depth -= 1
                        j += 1
                    
                    # Skip this block. Set last_pos to j.
                    last_pos = j
                    i = j - 1
                else:
                    # Good rule.
                    current_depth += 1
                    # Do nothing, just continue. We will append this chunk when we reach '}' or next '{' ?
                    # No, we append content[last_pos:i+1] perhaps?
                    # Let's just defer appending until we know it's good.
                    pass
                    
        elif content[i] == '}':
            current_depth -= 1
            if current_depth < 0:
                current_depth = 0 # Should not happen in valid CSS
                
        i += 1
        
    # At the end, we might have leftover text? 
    # The logic above only "skips". It doesn't "append".
    # Since we are modifying by skipping, we can assume everything is "kept" unless skipped.
    # But checking selector at `{` is the decision point.
    
    # Correct Logic:
    # `result_chunks` list.
    # `last_pos` = 0
    # Loop `i` from 0 to len:
    #   if `content[i]` == `{`:
    #       selector = content[last_pos:i]
    #       if bad_selector(selector) and not is_media(selector):
    #           # This is a block to skip.
    #           # 1. Append everything from last_pos to start of selector? 
    #           #    Wait, selector IS text we want to skip too!
    #           #    So append nothing.
    #           # 2. Find closing brace `j`.
    #           # 3. `last_pos` = `j` + 1 (or `j` depending on if we capture `}`)
    #           # 4. `i` = `j` - 1
    #       else:
    #           # Good block or media block. 
    #           # We treat it as content. 
    #           # We DON'T do anything yet, just continue.
    #           # The "text" remains in the "to be appended" range (which starts at `last_pos`).
    #           # BUT wait. If we are inside an @media block, we might hit a nested bad rule.
    #           # e.g. @media { .bad { ... } }
    #           # 1. `{` for @media detected. Good. Continue.
    #           # 2. `{` for .bad detected. Bad. 
    #                We need to append `content[last_pos:start_of_bad_selector]`.
    #                Then SKIP `start_of_bad_selector` to `end_of_bad_block`.
    #                Then `last_pos` = `end_of_bad_block`.
    #
    # This works.
    
    result_chunks = []
    last_pos = 0
    i = 0
    
    # We need to track media declaration vs rule declaration.
    # Handled by `is_media(selector)`.
    
    while i < len(content):
        if content[i] == '{':
            selector_end = i
            # Find start of selector. It is `last_pos`? 
            # Yes, because `last_pos` is updated to after the last processed block/char.
            selector = content[last_pos:selector_end]
            
            if "@media" in selector:
                # Keep it.
                pass
            else:
                # Check for badness
                clean_sel = re.sub(r'/\*.*?\*/', '', selector, flags=re.DOTALL)
                if (".mega-menu-megamenu" in clean_sel or 
                    "mega-menu-columns" in clean_sel or
                    "mega-menu-row" in clean_sel):
                    
                    # SKIP!
                    # 1. Append buffer before this block (if any valid text existed like whitespaces or previous blocks)
                    # Use last_pos. selector starts at last_pos.
                    # Wait, if selector included whitespaces valid for previous block, we might cut them?
                    # Usually CSS whitespace is flexible.
                    
                    # We assume `selector` text is part of what we want to delete.
                    
                    # Find end of block
                    temp_depth = 1
                    j = i + 1
                    while j < len(content) and temp_depth > 0:
                        if content[j] == '{':
                            temp_depth += 1
                        elif content[j] == '}':
                            temp_depth -= 1
                        j += 1
                    
                    # Bad block range: last_pos ... j
                    # We do NOT append this to results.
                    # We update last_pos to j.
                    last_pos = j
                    i = j - 1
                    continue
                
        i += 1
        
    # Append remaining
    result_chunks.append(content[last_pos:])
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("".join(result_chunks))

clean_css(r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.css", r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.clean.css")
