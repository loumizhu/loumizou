
import re

def clean_css_lines(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    output = []
    
    # State
    balance = 0
    skipping = False
    skip_level = 0
    
    # Selectors we want to purge
    # We want to remove rules (not media queries) containing these.
    bad_terms = ["mega-menu-megamenu", "mega-menu-columns", "mega-menu-row"]
    
    for line in lines:
        # Pre-calculate counts
        open_braces = line.count('{')
        close_braces = line.count('}')
        
        # Analyze line content for selector info (simplistic)
        # We assume standard formatting: selector { OR @media ... {
        
        # If we are skipping, checks if we should stop
        if skipping:
            # We are inside a bad block.
            # We need to track balance to know when we are out.
            # But "balance" tracks GLOBAL nesting.
            # When skipping started, we were at some balance level.
            # We stop skipping when balance drops BACK to that level.
            
            # Update balance based on this line
            balance += open_braces
            balance -= close_braces
            
            if balance <= skip_level:
                skipping = False
            
            continue

        # Not skipping. Check if we are starting a block.
        if '{' in line:
            # This line starts a block (or blocks).
            # Determine if it's a BAD block.
            
            # Check for bad terms
            is_bad = False
            for term in bad_terms:
                if term in line:
                    is_bad = True
                    break
            
            # Guard: Do not filter @media lines!
            if "@media" in line:
                is_bad = False
                
            # Note: "mega-menu-row" matches "mega-menu-row" class.
            # "mega-menu-megamenu" matches that class.
            
            if is_bad:
                skipping = True
                # The skip level is the balance BEFORE this block opens?
                # No, we want to skip until we return to the balance BEFORE this block.
                # Currently balance is 0 (example).
                # Line has "{". Balance becomes 1.
                # We want to skip until balance is 0 again.
                skip_level = balance 
                
                # Update balance for this line
                balance += open_braces
                balance -= close_braces
                
                # Edge case: One liner "{ ... }" -> balance returns to previous immediately?
                # If balance <= skip_level now, stop skipping immediately?
                # But we shouldn't print THIS line.
                
                if balance <= skip_level:
                    skipping = False
                
                continue
                
        # Update balance if we processed a line we are keeping
        balance += open_braces
        balance -= close_braces
        
        output.append(line)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output)

clean_css_lines(r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.css", r"e:\((_atWork_Old_))\(( Portfolio Business - Zou ))\Zou Website - Loumizou.com\Loumizou.Com-Static-Site\css\style.clean.css")
