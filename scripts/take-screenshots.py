"""
Takes screenshots of interactive xyflow sections in DECUR.
Run with: python scripts/take-screenshots.py
Requires: playwright (anaconda env)
"""
import time
from playwright.sync_api import sync_playwright

OUT = "public/screenshots"
BASE = "http://localhost:3000"
VP = {"width": 1400, "height": 900}

def shot(page, path):
    page.screenshot(path=f"{OUT}/{path}")
    print(f"  saved: {path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size(VP)

        # --- Relationship Network (explore, top section) ---
        print("Relationship Network...")
        page.goto(f"{BASE}/explore")
        page.wait_for_selector("#relationship-network", timeout=15000)
        page.evaluate("document.getElementById('relationship-network').scrollIntoView({behavior:'instant'})")
        time.sleep(3.5)
        shot(page, "explore-network.png")

        # --- Program Lineage flow ---
        print("Program Lineage...")
        page.goto(f"{BASE}/explore")
        page.wait_for_selector("#program-lineage", timeout=15000)
        page.evaluate("document.getElementById('program-lineage').scrollIntoView({behavior:'instant'})")
        time.sleep(3.0)
        shot(page, "flow-lineage.png")

        # --- Oversight Structure tab ---
        print("Oversight Structure...")
        page.goto(f"{BASE}/explore")
        page.wait_for_selector("#program-lineage", timeout=15000)
        page.evaluate("document.getElementById('program-lineage').scrollIntoView({behavior:'instant'})")
        time.sleep(0.5)
        page.get_by_role("button", name="Oversight Structure").click()
        time.sleep(3.5)
        shot(page, "flow-oversight.png")

        # --- Evidence Tiers (Cases) ---
        print("Evidence Tiers...")
        page.goto(f"{BASE}/explore")
        page.wait_for_selector("#evidence-tiers", timeout=15000)
        page.evaluate("document.getElementById('evidence-tiers').scrollIntoView({behavior:'instant'})")
        time.sleep(3.0)
        shot(page, "flow-evidence-tiers.png")

        browser.close()
        print("All done.")

main()
